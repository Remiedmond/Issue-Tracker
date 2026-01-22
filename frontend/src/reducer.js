export const initialState = {
  issues: [],
  loading: false,
  error: null
};

export function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, issues: action.payload };

    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_ISSUE':
      return { 
        ...state, 
        issues: [...state.issues, action.payload] 
      };

    case 'UPDATE_STATUS':
      return {
        ...state,
        issues: state.issues.map((i) =>
          i.id === action.payload.id ? { ...i, status: action.payload.status } : i
        ),
      };

    case 'DELETE_ISSUE':
      return {
        ...state,
        issues: state.issues.filter((i) => i.id !== action.payload),
      };

    default:
      return state;
  }
}