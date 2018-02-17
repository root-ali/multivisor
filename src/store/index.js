import Vue from 'vue'
import Vuex from 'vuex'
import * as multivisor from '../multivisor'
Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    multivisor: multivisor.nullMultivisor,
    user: {
      id: 'admin',
      role: 'administrator'
    },
    log: []
  },
  mutations: {
    setMultivisor (state, multivisor) {
      state.multivisor = multivisor
    },
    setProcess (state, process) {
      let supervisor = state.multivisor.supervisors[process.supervisor]
      supervisor.processes[process.uid] = process
    },
    setSupervisor (state, supervisor) {
      state.multivisor.supervisors[supervisor.name] = supervisor
    },
    appendLogMessage (state, log) {
      state.log.push(log)
    }
  },
  actions: {
    init ({ commit }) {
      multivisor.load()
        .then((data) => {
          commit('setMultivisor', data)
          const eventHandler = (event) => {
            if (event.event === 'process_changed') {
              commit('setProcess', event.payload)
            } else if (event.event === 'supervisor_changed') {
              commit('setSupervisor', event.payload)
            } else if (event.event === 'log') {
              commit('appendLogMessage', event.payload)
            }
          }
          multivisor.streamTo(eventHandler)
        })
    },
    restartProcesses (context, uids) {
      multivisor.processAction(uids, 'restart')
    },
    stopProcesses (context, uid) {
      multivisor.processAction(uid, 'stop')
    }

  },
  getters: {
    loadedSupervisors (state) {
      return Object.values(state.multivisor.supervisors)
    },
    loadedProcesses (state, getters) {
      let r = getters.loadedSupervisors.reduce((processes, supervisor) => {
        processes.push(...Object.values(supervisor.processes))
        return processes
      }, [])
      return r
    },
    loadedProcess (state) {
      return (uid) => {
        return state.loadedProcesses.find((process) => {
          return process.uid === uid
        })
      }
    },
    totalNbProcesses (state, getters) {
      return getters.loadedProcesses.length
    },
    nbRunningProcesses (state, getters) {
      return getters.loadedProcesses.reduce((acc, process) => {
        return process.running ? acc + 1 : acc
      }, 0)
    },
    nbStoppedProcesses (state, getters) {
      return getters.totalNbProcesses - getters.nbRunningProcesses
    },
    totalNbSupervisors (state, getters) {
      return getters.loadedSupervisors.length
    },
    nbRunningSupervisors (state, getters) {
      return getters.loadedSupervisors.reduce((acc, supervisor) => {
        return supervisor.running ? acc + 1 : acc
      }, 0)
    },
    nbStoppedSupervisors (state, getters) {
      return getters.totalNbSupervisors - getters.nbRunningSupervisors
    }
  }
})