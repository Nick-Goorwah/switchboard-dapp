import { TestBed, waitForAsync } from '@angular/core/testing';

import { ReplaySubject } from 'rxjs';

import { StakeEffects } from './stake.effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { LoadingService } from '../../shared/services/loading.service';
import { IamService } from '../../shared/services/iam.service';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { ToastrService } from 'ngx-toastr';
import * as StakeActions from './stake.actions';
import { StakingPoolServiceFacade } from '../../shared/services/staking/staking-pool-service-facade';
import { StakingPoolFacade } from '../../shared/services/pool/staking-pool-facade';
import * as LayoutActions from '../layout/layout.actions';
import { dialogSpy, iamServiceSpy, loadingServiceSpy, toastrSpy } from '@tests';
import { EnvService } from '../../shared/services/env/env.service';

describe('StakeEffects', () => {
  const stakingService = jasmine.createSpyObj('StakingPoolServiceFacade', [
    'init',
    'createPool',
    'putStake',
  ]);
  const stakingPoolFacadeSpy = jasmine.createSpyObj('StakingPoolFacade', [
    'putStake',
    'isPoolDefined',
  ]);
  let actions$: ReplaySubject<any>;
  let effects: StakeEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StakeEffects,
        { provide: IamService, useValue: iamServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: StakingPoolServiceFacade, useValue: stakingService },
        { provide: StakingPoolFacade, useValue: stakingPoolFacadeSpy },
        { provide: EnvService, useValue: { rootNamespace: 'iam.ewc' } },
        provideMockStore(),
        provideMockActions(() => actions$),
      ],
    });
    effects = TestBed.inject(StakeEffects);
  });

  describe('initStakingPoolService$', () => {
    beforeEach(() => {
      actions$ = new ReplaySubject(1);
    });

    it(
      'should return initPool action, getAccountBalance action and redirect action',
      waitForAsync(() => {
        actions$.next(StakeActions.initStakingPool());

        effects.initStakingPoolService$.subscribe((resultAction) => {
          expect(resultAction).toEqual(LayoutActions.redirect());
        });
      })
    );
  });
});
