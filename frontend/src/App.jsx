import { useReducer, useEffect, useState } from 'react';
import { reducer, initialState } from './reducer';

const API_URL = "http://localhost:3001/issues";

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' });

  //(get)=> récupérer les issues
  const fetchIssues = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: "Erreur de connexion au serveur" });
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  //(post)=> créer une nouvelle issue
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const newIssue = await res.json();
      dispatch({ type: 'ADD_ISSUE', payload: newIssue });
      setForm({ title: '', description: '', priority: 'MEDIUM' });
    } catch (err) {
      console.error("Erreur creation:", err);
    }
  };

  //(patch)=> modifier le statut d'une issue
  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
    } catch (err) {
      console.error("Erreur update:", err);
    }
  };

  //(delete)=> supprimer une issue
const deleteIssue = async (id) => {
  
  if (!window.confirm("Voulez-vous supprimer ce ticket ?")) {
    return;
  }
  try {
    const url = API_URL + "/" + id;

    const response = await fetch(url, { method: 'DELETE' });
    if (response.ok) {
      dispatch({ type: 'DELETE_ISSUE', payload: id });
    }
  } catch (err) {
    console.error("Erreur suppression:", err);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Issue Tracker</h1>

        {/* Formulaire */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="font-bold mb-4 text-lg">Créer une issue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              className="w-full border-b py-2 outline-none focus:border-blue-500"
              placeholder="Titre (ex: Bug login)"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
            <textarea 
              className="w-full border-b py-2 outline-none focus:border-blue-500 resize-none"
              placeholder="Décris le problème..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Priorité</label>
              <select 
                className="bg-gray-100 rounded px-2 py-1"
                value={form.priority}
                onChange={e => setForm({...form, priority: e.target.value})}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Ajouter l'issue
            </button>
          </form>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">Issues ({state.issues.length})</h2>
            <button onClick={fetchIssues} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
              Refresh
            </button>
          </div>

          {state.loading && <p className="text-gray-500">Chargement...</p>}
          {state.error && <p className="text-red-500">{state.error}</p>}

          <div className="space-y-4">
            {state.issues.map(issue => (
              <div key={issue.id} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold">{issue.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{issue.description}</p>
                <div className="flex gap-2 mb-4">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase">
                    {issue.status}
                  </span>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded uppercase">
                    {issue.priority}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <select 
                    className="text-sm bg-white border rounded px-1"
                    value={issue.status}
                    onChange={(e) => updateStatus(issue.id, e.target.value)}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                  <button 
                   className="text-red-500 text-sm font-bold hover:underline"
                    onClick={() => deleteIssue(issue.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}