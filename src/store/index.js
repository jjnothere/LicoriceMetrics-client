import { createStore } from 'vuex';

const store = createStore({
  state: {
    selectedAdAccountId: '' // Add your initial state here
  },
  mutations: {
    setSelectedAdAccountId(state, accountId) {
      state.selectedAdAccountId = accountId;
    }
  },
  actions: {
    updateSelectedAdAccountId({ commit }, accountId) {
      commit('setSelectedAdAccountId', accountId);
    }
  },
  getters: {
    selectedAdAccountId: state => state.selectedAdAccountId
  }
});

export default store;
