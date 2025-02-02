/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { CancelButton } from '../../../layout/loading/loading.component';
import { IamService } from '../../../shared/services/iam.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationDialogComponent } from '../../widgets/confirmation-dialog/confirmation-dialog.component';
import { SwitchboardToastrService } from '../../../shared/services/switchboard-toastr.service';
import { Store } from '@ngrx/store';
import { UserClaimState } from '../../../state/user-claim/user.reducer';
import * as userSelectors from '../../../state/user-claim/user.selectors';
import { EnrolmentForm } from '../../registration/enrolment-form/enrolment-form.component';

const TOASTR_HEADER = 'Enrolment Request';

@Component({
  selector: 'app-view-requests',
  templateUrl: './view-requests.component.html',
  styleUrls: ['./view-requests.component.scss'],
})
export class ViewRequestsComponent implements OnInit {
  @ViewChild('issuerFields', { static: false }) requiredFields: EnrolmentForm;
  listType: string;
  claim: any;
  fields = [];
  issuerFields = [];
  userDid$ = this.store.select(userSelectors.getDid);
  claimParams;
  fieldList = [];

  constructor(
    public dialogRef: MatDialogRef<ViewRequestsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private iamService: IamService,
    private toastr: SwitchboardToastrService,
    private loadingService: LoadingService,
    private store: Store<UserClaimState>,
    private notifService: NotificationService
  ) {}

  canAccept() {
    return (
      this.listType === 'issuer' &&
      !this.claim?.isAccepted &&
      !this.claim?.isRejected
    );
  }

  get isApproveDisabled() {
    return Boolean(
      !this?.requiredFields?.isValid() && this.roleContainRequiredParams()
    );
  }

  roleContainRequiredParams() {
    return this.fieldList.length > 0;
  }

  async ngOnInit() {
    this.listType = this.data.listType;
    this.claim = this.data.claimData;
    await this.getRoleIssuerFields(this.claim.claimType);
    if (this.claim) {
      await this.setIssuerFields();
      await this.setRequestorFields();
    }
  }

  async approve() {
    this.loadingService.show(
      'Please confirm this transaction in your connected wallet.',
      CancelButton.ENABLED
    );
    try {
      const req = {
        requester: this.claim.requester,
        id: this.claim.id,
        token: this.claim.token,
        subjectAgreement: this.claim.subjectAgreement,
        registrationTypes: this.claim.registrationTypes,
        issuerFields: this.requiredFields?.fieldsData() || [],
      };

      await this.iamService.claimsService.issueClaimRequest(req);

      this.notifService.decreasePendingApprovalCount();
      this.toastr.success('Request is approved.', TOASTR_HEADER);
      this.dialogRef.close(true);
    } catch (e) {
      this.toastr.error(e?.message, TOASTR_HEADER);
    } finally {
      this.loadingService.hide();
    }
  }

  reject() {
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: '400px',
        maxHeight: '195px',
        data: {
          header: TOASTR_HEADER,
          message: 'Are you sure to reject this request?',
          isDiscardButton: false,
        },
        maxWidth: '100%',
        disableClose: true,
      })
      .afterClosed()
      .subscribe(async (res: any) => {
        if (res) {
          this.loadingService.show();
          try {
            await this.iamService.claimsService.rejectClaimRequest({
              id: this.claim.id,
              requesterDID: this.claim.requester,
            });
            this.notifService.decreasePendingApprovalCount();
            this.toastr.success(
              'Request is rejected successfully.',
              TOASTR_HEADER
            );
            this.dialogRef.close(true);
          } catch (e) {
            console.error(e);
          } finally {
            this.loadingService.hide();
          }
        }
      });
  }

  private async getRoleIssuerFields(namespace: string) {
    this.loadingService.show();
    const definitions: any = await this.iamService.getRolesDefinition([
      namespace,
    ]);
    const issuerFieldList = definitions[namespace]?.issuerFields;
    if (
      issuerFieldList &&
      Array.isArray(issuerFieldList) &&
      issuerFieldList.length > 0
    ) {
      this.fieldList = issuerFieldList;
    }
    this.loadingService.hide();
  }

  private async setIssuerFields() {
    if (this.claim.issuedToken) {
      const decoded = await this.decode(this.claim.issuedToken);
      if (decoded.claimData) {
        this.issuerFields = decoded.claimData?.issuerFields
          ? decoded.claimData?.issuerFields
          : [];
      }
    }
  }

  private async setRequestorFields() {
    if (this.claim.token) {
      const decoded = await this.decode(this.claim.token);
      if (decoded.claimData) {
        this.fields = decoded.claimData?.fields
          ? decoded.claimData?.fields
          : [];
      }
    }
  }

  private async decode(token): Promise<any> {
    return await this.iamService.didRegistry.decodeJWTToken({
      token,
    });
  }
}
