import React, { createContext, useContext, useReducer, useEffect } from 'react'

const CalculatorContext = createContext()

// Initial state
const initialState = {
  calculations: {
    mortgage: {},
    bsd: {},
    absd: {},
    ssd: {},
    tdsr: {},
    cpf: {},
    'income-tax': {},
    'corporate-tax': {},
    investment: {},
    'hdb-upgrade': {},
    affordability: {},
  },
  savedScenarios: [],
  currentScenario: null,
  isLoading: false,
  error: null
}

// Action types
const actionTypes = {
  SET_CALCULATION: 'SET_CALCULATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SAVE_SCENARIO: 'SAVE_SCENARIO',
  LOAD_SCENARIO: 'LOAD_SCENARIO',
  DELETE_SCENARIO: 'DELETE_SCENARIO',
  CLEAR_CALCULATIONS: 'CLEAR_CALCULATIONS'
}

// Reducer
function calculatorReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_CALCULATION:
      return {
        ...state,
        calculations: {
          ...state.calculations,
          [action.module]: action.data
        },
        error: null
      }
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.loading
      }
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.error,
        isLoading: false
      }
    
    case actionTypes.SAVE_SCENARIO:
      const newScenario = {
        id: Date.now().toString(),
        name: action.name,
        timestamp: new Date().toISOString(),
        calculations: state.calculations
      }
      return {
        ...state,
        savedScenarios: [...state.savedScenarios, newScenario],
        currentScenario: newScenario.id
      }
    
    case actionTypes.LOAD_SCENARIO:
      const scenario = state.savedScenarios.find(s => s.id === action.id)
      return {
        ...state,
        calculations: scenario ? scenario.calculations : state.calculations,
        currentScenario: action.id
      }
    
    case actionTypes.DELETE_SCENARIO:
      return {
        ...state,
        savedScenarios: state.savedScenarios.filter(s => s.id !== action.id),
        currentScenario: state.currentScenario === action.id ? null : state.currentScenario
      }
    
    case actionTypes.CLEAR_CALCULATIONS:
      return {
        ...state,
        calculations: initialState.calculations,
        currentScenario: null
      }
    
    default:
      return state
  }
}

// Provider component
export function CalculatorProvider({ children }) {
  const [state, dispatch] = useReducer(calculatorReducer, initialState)

  // Load saved scenarios from localStorage on mount
  useEffect(() => {
    const savedScenarios = localStorage.getItem('sg-finance-calculator-scenarios')
    if (savedScenarios) {
      try {
        const parsed = JSON.parse(savedScenarios)
        parsed.forEach(scenario => {
          dispatch({
            type: actionTypes.SAVE_SCENARIO,
            name: scenario.name,
            id: scenario.id
          })
        })
      } catch (error) {
        console.error('Error loading saved scenarios:', error)
      }
    }
  }, [])

  // Save scenarios to localStorage whenever they change
  useEffect(() => {
    if (state.savedScenarios.length > 0) {
      localStorage.setItem('sg-finance-calculator-scenarios', JSON.stringify(state.savedScenarios))
    }
  }, [state.savedScenarios])

  // Context value
  const value = {
    state,
    dispatch,
    actions: {
      setCalculation: (module, data) => dispatch({ type: actionTypes.SET_CALCULATION, module, data }),
      setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, loading }),
      setError: (error) => dispatch({ type: actionTypes.SET_ERROR, error }),
      saveScenario: (name) => dispatch({ type: actionTypes.SAVE_SCENARIO, name }),
      loadScenario: (id) => dispatch({ type: actionTypes.LOAD_SCENARIO, id }),
      deleteScenario: (id) => dispatch({ type: actionTypes.DELETE_SCENARIO, id }),
      clearCalculations: () => dispatch({ type: actionTypes.CLEAR_CALCULATIONS })
    }
  }

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  )
}

// Custom hook to use the calculator context
export function useCalculator() {
  const context = useContext(CalculatorContext)
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider')
  }
  return context
}
