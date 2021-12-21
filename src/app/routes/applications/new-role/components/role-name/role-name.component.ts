import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { isAlphaNumericOnly } from '../../../../../utils/functions/is-alpha-numeric';
import { ENSPrefixes } from '../../new-role.component';
import { FormControl, Validators } from '@angular/forms';
import { isAlphanumericValidator } from '../../../../../utils/validators/is-alphanumeric.validator';
import { RoleCreationService } from '../../services/role-creation.service';

@Component({
  selector: 'app-role-name',
  templateUrl: './role-name.component.html',
  styleUrls: ['./role-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleNameComponent {
  @Input() roleType: string;
  @Input() parentNamespace: string;

  @Output() proceed = new EventEmitter<string>();
  @Output() abort = new EventEmitter<{ touched: boolean }>();

  form = new FormControl(
    '', [Validators.required, Validators.minLength(3), Validators.maxLength(256), isAlphanumericValidator]
  );
  existAndNotOwner;

  constructor(private roleCreationService: RoleCreationService) {
  }

  get ensNamespace(): string {
    return this.form.value + '.' + ENSPrefixes.Roles + '.' + this.parentNamespace;
  }

  controlHasError(control: string, errorType: string): boolean {
    return this.form.hasError(errorType);
  }

  alphaNumericOnly(event: any, includeDot?: boolean): boolean {
    this.existAndNotOwner = false;
    return isAlphaNumericOnly(event, includeDot);
  }

  cancel(): void {
    this.abort.next({touched: this.form.touched});
  }

  async next(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    const canProceed = await this.roleCreationService.checkIfUserCanUseDomain(this.ensNamespace);
    this.existAndNotOwner = !canProceed;
    if (canProceed) {
      this.proceed.next(this.form.value);
    }

  }

}
