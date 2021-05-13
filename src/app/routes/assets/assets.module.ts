import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetsComponent } from './assets.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from 'src/app/shared/shared.module';
import { GovernanceDetailsModule } from '../applications/governance-view/governance-details/governance-details.module';
import { NgMatSearchBarModule } from 'ng-mat-search-bar';
import { NewAssetTypeComponent } from './new-asset-type/new-asset-type.component';
import { NewPassiveAssetComponent } from './new-passive-asset/new-passive-asset.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetOwnershipHistoryComponent } from './asset-ownership-history/asset-ownership-history.component';
import { AssetEnrolmentListComponent } from './asset-enrolment-list/asset-enrolment-list.component';
import { EditAssetDialogComponent } from './edit-asset-dialog/edit-asset-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { OwnedComponent } from './owned/owned.component';
import { OfferedToComponent } from './offered-to/offered-to.component';
import { PreviouslyOwnedComponent } from './previously-owned/previously-owned.component';

const routes: Routes = [
  {
    path: '', component: AssetsComponent,
    children: [
      { path: '', redirectTo: 'owned', pathMatch: 'full'},
      { path: 'owned', component: OwnedComponent, data: {animationId: 0} },
      { path: 'offered', component: OfferedToComponent, data: {animationId: 1} },
      { path: 'previously', component: PreviouslyOwnedComponent, data: {animationId: 2} },
    ]
  },
  { path: 'enrolment/:subject', component: AssetEnrolmentListComponent }
];


@NgModule({
  declarations: [
    AssetsComponent,
    NewAssetTypeComponent,
    NewPassiveAssetComponent,
    AssetListComponent,
    AssetOwnershipHistoryComponent,
    AssetEnrolmentListComponent,
    EditAssetDialogComponent,
    OwnedComponent,
    OfferedToComponent,
    PreviouslyOwnedComponent
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
    NgMatSearchBarModule
  ],
  entryComponents: [NewAssetTypeComponent, NewPassiveAssetComponent, AssetOwnershipHistoryComponent, EditAssetDialogComponent]
})
export class AssetsModule {
}
