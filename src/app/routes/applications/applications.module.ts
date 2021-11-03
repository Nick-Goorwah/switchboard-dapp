import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ApplicationsComponent } from './applications.component';
import { NewOrganizationComponent } from './new-organization/new-organization.component';
import { ViewOrganizationComponent } from './view-organization/view-organization.component';
import { NewApplicationComponent } from './new-application/new-application.component';
import { NewRoleComponent } from './new-role/new-role.component';
import { TransferOwnershipComponent } from './transfer-ownership/transfer-ownership.component';
import { RemoveOrgAppComponent } from './remove-org-app/remove-org-app.component';
import { GovernanceDetailsModule } from './governance-view/governance-details/governance-details.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { NewStakingPoolComponent } from './new-staking-pool/new-staking-pool.component';
import { OrganizationActionsComponent } from './actions/organization-actions/organization-actions.component';
import { ApplicationActionsComponent } from './actions/application-actions/application-actions.component';
import { RoleActionsComponent } from './actions/role-actions/role-actions.component';
import { NgxEditorModule } from 'ngx-editor';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { TransactionsCompleteComponent } from './transactions-complete/transactions-complete.component';
import { RoleListComponent } from './role-list/role-list.component';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ActionsMenuComponent } from './actions/actions-menu/actions-menu.component';
import { FilterComponent } from './filter/filter.component';
import { CreateFieldsModule } from './new-role/components/create-fields/create-fields.module';
import { IssuerFieldsComponent } from './new-role/components/issuer-fields/issuer-fields.component';
import { IssuerFieldFormComponent } from './new-role/components/issuer-field-form/issuer-field-form.component';
import { IssuerFieldsSummaryComponent } from './new-role/components/issuer-fields-summary/issuer-fields-summary.component';

const routes: Routes = [
  {path: '', component: ApplicationsComponent}
];

@NgModule({
  declarations: [
    ApplicationsComponent,
    NewOrganizationComponent,
    ViewOrganizationComponent,
    NewApplicationComponent,
    NewRoleComponent,
    TransferOwnershipComponent,
    RemoveOrgAppComponent,
    NewStakingPoolComponent,
    OrganizationActionsComponent,
    ApplicationActionsComponent,
    RoleActionsComponent,
    OrganizationListComponent,
    RoleListComponent,
    ApplicationListComponent,
    ActionsMenuComponent,
    FilterComponent,
    ActionsMenuComponent,
    TransactionsCompleteComponent,
    IssuerFieldsComponent,
    IssuerFieldFormComponent,
    IssuerFieldsSummaryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    RouterModule,
    MatSelectModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    NgxSpinnerModule,
    MatDialogModule,
    MatInputModule,
    GovernanceDetailsModule,
    MatExpansionModule,
    NgxEditorModule,
    CreateFieldsModule
  ],
  entryComponents: [
    NewOrganizationComponent,
    NewApplicationComponent,
    NewRoleComponent,
    TransferOwnershipComponent,
    RemoveOrgAppComponent
  ]
})
export class ApplicationsModule {
}
