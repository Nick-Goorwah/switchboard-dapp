import { Injectable } from '@angular/core';
import {
  AccountInfo,
  AssetsService,
  CacheClient,
  ClaimData,
  ClaimsService,
  DidRegistry,
  DomainsService,
  initWithEKC,
  initWithGnosis,
  initWithKms,
  initWithMetamask,
  initWithPrivateKeySigner,
  initWithWalletConnect,
  IRole,
  MessagingMethod,
  MessagingService,
  NamespaceType,
  ProviderType,
  setCacheConfig,
  setChainConfig,
  setMessagingConfig,
  SignerService,
  StakingFactoryService,
} from 'iam-client-lib';
import { IDIDDocument } from '@ew-did-registry/did-resolver-interface';
import { LoadingService } from './loading.service';
import { safeAppSdk } from './gnosis.safe.service';
import { from, Observable } from 'rxjs';
import { LoginOptions } from './login/login.service';
import { truthy } from '@operators';
import { finalize, map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

export const PROVIDER_TYPE = 'ProviderType';

export type InitializeData = {
  did: string | undefined;
  connected: boolean;
  userClosedModal: boolean;
  didDocument: IDIDDocument | null;
  identityToken?: string;
  realtimeExchangeConnected: boolean;
  accountInfo: AccountInfo | undefined;
};

@Injectable({
  providedIn: 'root'
})
export class IamService {
  signerService: SignerService;
  didRegistry: DidRegistry;
  claimsService: ClaimsService;
  messagingService: MessagingService;
  domainsService: DomainsService;
  stakingService: StakingFactoryService;
  assetsService: AssetsService;
  cacheClient: CacheClient;

  constructor(
    private loadingService: LoadingService,
    private envService: EnvService
  ) {
    // Set Cache Server
    setCacheConfig(envService.chainId, {
      url: envService.cacheServerUrl,
    });

    // Set RPC
    setChainConfig(envService.chainId, this.getChainConfig());

    // Set Messaging Options
    setMessagingConfig(envService.chainId, {
      messagingMethod: MessagingMethod.Nats,
      natsServerUrl: envService.natsServerUrl,
      natsEnvironmentName: envService.natsEnvironmentName,
    });
  }

  get address() {
    return this.signerService.address;
  }

  get providerType() {
    return this.signerService.providerType;
  }

  issueClaim(data: { subject: string; claim: any }) {
    return this.wrapWithLoadingService(this.claimsService.issueClaim(data));
  }

  getClaimsBySubject(did: string) {
    return from(this.claimsService.getClaimsBySubject({
      did
    })).pipe(map(claims => claims.filter((claim) => !claim.isRejected)));
  }

  getAllowedRolesByIssuer(): Observable<IRole[]> {
    return this.wrapWithLoadingService(this.domainsService.getAllowedRolesByIssuer(this.signerService.did) as any as Promise<IRole[]>);
  }

  getRolesDefinition(namespaces: string[]) {
    return this.cacheClient.getRolesDefinition(namespaces);
  }

  registerAsset() {
    return from(this.assetsService.registerAsset());
  }

  getUserClaims(did?: string) {
    return from(this.claimsService.getUserClaims({did}));
  }

  createSelfSignedClaim(
    {data, subject}: {
      data: ClaimData;
      subject?: string;
    }) {
    return from(this.claimsService.createSelfSignedClaim({data, subject}));
  }

  deleteOrganization(namespace: string, returnSteps: boolean) {
    return this.domainsService.deleteOrganization({
      namespace: namespace,
      returnSteps,
    });
  }

  getOrgHistory(namespace: string) {
    return this.wrapWithLoadingService(
      this.domainsService.getOrgHierarchy(namespace)
    );
  }

  getAssetById(id) {
    return this.wrapWithLoadingService(
      this.assetsService.getAssetById({id}),
      {message: 'Getting selected asset data...'}
    );
  }

  closeConnection() {
    return from(this.signerService.closeConnection()).pipe(truthy());
  }

  async initializeConnection({providerType, initCacheServer = true, createDocument = true}: LoginOptions) {
    try {
      const {
        signerService,
        messagingService,
        connectToCacheServer,
      } = await this.initSignerService(providerType);
      this.signerService = signerService;
      this.messagingService = messagingService;
      if (initCacheServer) {
        const {
          domainsService,
          stakingPoolService,
          assetsService,
          connectToDidRegistry,
          cacheClient
        } = await connectToCacheServer();
        this.domainsService = domainsService;
        this.stakingService = stakingPoolService;
        this.assetsService = assetsService;
        this.cacheClient = cacheClient;
        if (createDocument) {
          const {didRegistry, claimsService} = await connectToDidRegistry();
          this.didRegistry = didRegistry;
          this.claimsService = claimsService;
        }
      }
    } catch (e) {
      console.error(e);
      return {
        did: undefined,
        connected: false,
        userClosedModal: e.message === 'User closed modal',
        realtimeExchangeConnected: false,
        accountInfo: undefined,
      };
    }
    return {
      did: this.signerService.did,
      connected: true,
      userClosedModal: false,
      realtimeExchangeConnected: true,
      accountInfo: this.signerService.accountInfo,
    };
  }

  getDefinition(organization: string) {
    return from(
      this.domainsService.getDefinition({
        type: NamespaceType.Organization,
        namespace: organization,
      })
    );
  }

  getDidDocument(data?: { did: string; includeClaims: boolean }) {
    return from(this.didRegistry.getDidDocument(data));
  }

  getPublicKey() {
    return this.signerService.publicKey();
  }

  async getBalance() {
    return await this.signerService.balance();
  }

  isOwner(namespace: string) {
    return from(this.domainsService.isOwner({domain: namespace}));
  }

  getOrganizationsByOwner() {
    return from(this.getENSTypesByOwner(NamespaceType.Organization));
  }

  async getENSTypesByOwner(ensType: NamespaceType) {
    return await this.domainsService.getENSTypesByOwner({
      type: ensType,
      owner: this.address,
    });
  }

  public wrapWithLoadingService<T>(
    source: Promise<T> | Observable<T>,
    loaderConfig?: { message: string | string[]; cancelable?: boolean }
  ) {
    this.loadingService.show(
      loaderConfig?.message || '',
      !!loaderConfig?.cancelable
    );
    return from(source).pipe(finalize(() => this.loadingService.hide()));
  }

  private getChainConfig() {
    const chainConfig: any = {
      rpcUrl: this.envService.rpcUrl,
    };

    if (this.envService.stakingPoolFactoryAddress) {
      chainConfig.stakingPoolFactoryAddress = this.envService.stakingPoolFactoryAddress;
    }
    return chainConfig;
  }

  private async initSignerService(
    providerType: ProviderType,
  ) {
    switch (providerType) {
      case ProviderType.MetaMask:
        return initWithMetamask();
      case ProviderType.WalletConnect:
        return initWithWalletConnect();
      case ProviderType.EwKeyManager:
        return initWithKms({kmsServerUrl: this.envService.kmsServerUrl});
      case ProviderType.PrivateKey:
        return initWithPrivateKeySigner(
          localStorage.getItem('PrivateKey'),
          this.envService.rpcUrl
        );
      case ProviderType.Gnosis:
        return initWithGnosis(safeAppSdk);
      case ProviderType.EKC:
        return initWithEKC();
    }
  }
}
