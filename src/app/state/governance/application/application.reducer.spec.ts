import * as fromReducer from './application.reducer';
import * as ApplicationActions from './application.actions';
import { IApp, NamespaceType } from 'iam-client-lib';

describe('Application reducer', () => {
  describe('getListSuccess action', () => {
    it('should set list in a immutable way', () => {
      const { initialState } = fromReducer;
      const list = [{ namespace: 'test' } as IApp] as IApp[];
      const action = ApplicationActions.getListSuccess({
        list,
        namespace: 'iam.ewc',
      });
      const state = fromReducer.reducer(initialState, action);

      expect(state.list).toEqual(list);
      expect(state.list).not.toBe(
        list,
        'state.list have the same reference as list'
      );
    });

    it('should set filteredList in a immutable way', () => {
      const { initialState } = fromReducer;
      const list = [{ namespace: 'test' } as IApp] as IApp[];
      const action = ApplicationActions.getListSuccess({
        list,
        namespace: 'iam.ewc',
      });
      const state = fromReducer.reducer(initialState, action);

      expect(state.filteredList).toEqual(list);
      expect(state.filteredList).not.toBe(list);
    });

    it('should filter list when getting new array or applications', () => {
      const { initialState } = fromReducer;
      const list = [
        { namespace: 'test.iam.ewc' },
        { namespace: `testapp.${NamespaceType.Application}.abc.iam.ewc` },
      ] as IApp[];

      const modifiedState = {
        ...initialState,
        filters: { ...initialState.filters, organization: 'abc' },
      };
      const action = ApplicationActions.getListSuccess({
        list,
        namespace: 'iam.ewc',
      });
      const state = fromReducer.reducer(modifiedState, action);

      expect(state.filteredList).toEqual([
        { namespace: `testapp.${NamespaceType.Application}.abc.iam.ewc` },
      ] as IApp[]);
      expect(state.filteredList.length).toBe(1);
    });
  });

  describe('updateFilters action', () => {
    it('should update filters in immutable way', () => {
      const { initialState } = fromReducer;

      const filters = { organization: 'org', application: 'app', role: '' };
      const action = ApplicationActions.updateFilters({
        filters,
        namespace: 'iam.ewc',
      });
      const state = fromReducer.reducer(initialState, action);

      expect(state.filters).toEqual(filters);
      expect(state.filters).not.toBe(filters);
    });

    it('should update filteredList when updating filters', () => {
      const { initialState } = fromReducer;
      const list = [
        { namespace: 'test.iam.ewc' },
        { namespace: `testapp.${NamespaceType.Application}.abc.iam.ewc` },
      ] as IApp[];

      const modifiedState = { ...initialState, list };
      const filters = { organization: 'abc', application: 'testapp', role: '' };
      const action = ApplicationActions.updateFilters({
        filters,
        namespace: 'iam.ewc',
      });
      const state = fromReducer.reducer(modifiedState, action);

      expect(state.filteredList).toEqual([
        { namespace: `testapp.${NamespaceType.Application}.abc.iam.ewc` },
      ] as IApp[]);
      expect(state.filteredList.length).toBe(1);
    });
  });

  describe('toggleFilters action', () => {
    it('should toggle filterVisible property', () => {
      const { initialState } = fromReducer;
      const action = ApplicationActions.toggleFilters();
      const state = fromReducer.reducer(initialState, action);

      expect(state.filterVisible).toEqual(true);
    });
  });

  describe('cleanUpFilters action', () => {
    it('should clean filters as in initialState', () => {
      const { initialState } = fromReducer;

      const list = [
        { namespace: 'test.iam.ewc' },
        { namespace: `testapp.${NamespaceType.Application}.abc.iam.ewc` },
      ];

      const modifiedState = {
        list,
        filters: {
          organization: 'abc',
          application: 'test',
          role: '',
        },
        filteredList: [
          { namespace: `testapp.${NamespaceType.Application}.abc.iam.ewc` },
        ],
        filterVisible: true,
      };

      const action = ApplicationActions.cleanUpFilters();
      const state = fromReducer.reducer(
        modifiedState as fromReducer.ApplicationState,
        action
      );

      expect(state.filterVisible).toBeFalse();
      expect(state.filters).toEqual(initialState.filters);
      expect(state.filteredList).toEqual(list as IApp[]);
    });
  });
});
