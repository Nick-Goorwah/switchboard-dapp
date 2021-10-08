import { TestBed } from '@angular/core/testing';

import { of, ReplaySubject, throwError } from 'rxjs';

import { UserEffects } from './user.effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { LoadingService } from '../../shared/services/loading.service';
import { IamService } from '../../shared/services/iam.service';
import { MatDialog } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { UserClaimState } from './user.reducer';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { dialogSpy, iamServiceSpy, loadingServiceSpy, toastrSpy } from '@tests';
import * as UserClaimActions from './user.actions';
import * as UserClaimSelectors from './user.selectors';

describe('UserEffects', () => {

  let actions$: ReplaySubject<any>;
  let effects: UserEffects;
  let store: MockStore<UserClaimState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserEffects,
        {provide: IamService, useValue: iamServiceSpy},
        {provide: LoadingService, useValue: loadingServiceSpy},
        {provide: MatDialog, useValue: dialogSpy},
        {provide: ToastrService, useValue: toastrSpy},
        provideMockStore(),
        provideMockActions(() => actions$),
      ],
    });
    store = TestBed.inject(MockStore);

    effects = TestBed.inject(UserEffects);
  });

  describe('loadUserClaims', () => {
    beforeEach(() => {
      actions$ = new ReplaySubject(1);
    });

    it('should return user claims success action with loaded claims', (done) => {
      const claims = [{
        iat: 1612522971162,
      }];
      actions$.next(UserClaimActions.loadUserClaims());
      iamServiceSpy.getUserClaims.and.returnValue(of(claims));

      effects.loadUserClaims$.subscribe(resultAction => {
        expect(resultAction).toEqual(UserClaimActions.loadUserClaimsSuccess({userClaims: claims} as any));
        done();
      });
    });
    it('should return error action when get 404 error', (done) => {
      actions$.next(UserClaimActions.loadUserClaims());
      iamServiceSpy.getUserClaims.and.returnValue(throwError({status: 404}));

      effects.loadUserClaims$.subscribe(resultAction => {
        expect(resultAction).toEqual(UserClaimActions.loadUserClaimsFailure({error: {status: 404}}));
        done();
      });
    });
  });

  describe('loadUserClaimsSuccess', () => {
    beforeEach(() => {
      actions$ = new ReplaySubject(1);
    });

    it('should return empty object as a profile when passing empty list', (done) => {
      const claims = [];
      actions$.next(UserClaimActions.loadUserClaimsSuccess({userClaims: claims}));

      effects.getUserProfile$.subscribe(resultAction => {
        expect(resultAction).toEqual(UserClaimActions.setProfile({profile: {}}));
        done();
      });
    });

    it('should return empty object as a  profile when claim do not have profile', (done) => {
      const claims = [{
        iat: 1612522971162,
      }];
      actions$.next(UserClaimActions.loadUserClaimsSuccess({userClaims: claims} as any));

      effects.getUserProfile$.subscribe(resultAction => {
        expect(resultAction).toEqual(UserClaimActions.setProfile({profile: {}}));
        done();
      });
    });

    it('should return profile when claim contains it', (done) => {
      const profile = {
        name: 'name',
        address: 'address',
        birthdate: '-2335224240000',
        assetProfiles: {
          'did:ethr:0x': {
            icon: '',
            name: 'test123'
          },
          'did:ethr:0x1': {
            icon: '',
            name: 'test'
          }
        }
      };
      const claims = [{
        iat: 1621349891424,
        profile,
      }];

      actions$.next(UserClaimActions.loadUserClaimsSuccess({userClaims: claims} as any));

      effects.getUserProfile$.subscribe(resultAction => {
        expect(resultAction).toEqual(UserClaimActions.setProfile({profile}));
        done();
      });
    });

    it('should return newest claim profile', (done) => {
      const lastClaim = {
        iat: 1623158758154,
        profile: {
          name: 'last',
          address: 'last address',
          birthdate: 360194400000
        }
      };
      const secondClaim = {
        iat: 1623180791487,
        profile: {
          name: 'second',
          address: 'second address',
          birthdate: 360194400000,
          assetProfiles: {
            'did:ethr:0x': {
              icon: '',
              name: 'second name'
            }
          }
        },
      };
      const firstClaim = {
        iat: 1623180894274,
        profile: {
          name: 'first',
          address: 'd',
          birthdate: 360194400000,
          assetProfiles: {
            'did:ethr:0x': {
              icon: '',
              name: 'first name'
            }
          }
        },
      };
      const claims = [lastClaim, firstClaim, secondClaim];
      actions$.next(UserClaimActions.loadUserClaimsSuccess({userClaims: claims} as any));

      effects.getUserProfile$.subscribe(resultAction => {
        expect(resultAction).toEqual(UserClaimActions.setProfile({profile: firstClaim.profile} as any));
        done();
      });
    });

  });

  describe('updateUserProfile$', () => {
    let userProfile;
    beforeEach(() => {
      actions$ = new ReplaySubject(1);
    });

    it('should set user profile and check for called methods', (done) => {
      userProfile = store.overrideSelector(UserClaimSelectors.getUserProfile, {});
      actions$.next(UserClaimActions.updateUserClaims({profile: {name: 'test'}}));
      iamServiceSpy.createSelfSignedClaim.and.returnValue(Promise.resolve(true));

      effects.updateUserProfile$.pipe(
        finalize(() => {
          expect(loadingServiceSpy.hide).toHaveBeenCalled();
          expect(dialogSpy.closeAll).toHaveBeenCalled();
        })
      ).subscribe(resultAction => {
        expect(loadingServiceSpy.show).toHaveBeenCalled();
        expect(toastrSpy.success).toHaveBeenCalled();
        expect(resultAction).toEqual(UserClaimActions.updateUserClaimsSuccess({
          profile: {
            name: 'test',
            assetProfiles: {}
          }
        }));
        done();
      });
    });

    it('should update existing user profile name', (done) => {
      const assetProfiles = {'did:ethr': {name: 'asset name', icon: ''}};
      userProfile = store.overrideSelector(UserClaimSelectors.getUserProfile,
        {name: 'old', assetProfiles}
      );
      actions$.next(UserClaimActions.updateUserClaims({profile: {name: 'new'}}));
      iamServiceSpy.createSelfSignedClaim.and.returnValue(Promise.resolve(true));

      effects.updateUserProfile$.subscribe(resultAction => {
        expect(resultAction).toEqual(
          UserClaimActions.updateUserClaimsSuccess({profile: {name: 'new', assetProfiles}})
        );
        done();
      });
    });

    it('should update asset profiles', (done) => {
      const assetProfilesOld = {'did:ethr': {name: 'asset name', icon: ''}};
      userProfile = store.overrideSelector(UserClaimSelectors.getUserProfile,
        {name: 'old', assetProfiles: assetProfilesOld}
      );
      const assetProfilesNew = {'did:ethr23': {name: 'asset', icon: ''}};
      actions$.next(UserClaimActions.updateUserClaims({profile: {name: 'new', assetProfiles: assetProfilesNew}}));
      iamServiceSpy.createSelfSignedClaim.and.returnValue(Promise.resolve(true));

      effects.updateUserProfile$.subscribe(resultAction => {
        expect(resultAction).toEqual(
          UserClaimActions.updateUserClaimsSuccess({
            profile: {
              name: 'new',
              assetProfiles: {
                ...assetProfilesOld, ...assetProfilesNew
              }
            }
          })
        );
        done();
      });
    });
  });

});
