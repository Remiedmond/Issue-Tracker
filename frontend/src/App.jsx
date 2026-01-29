import { useReducer, useEffect, useState } from 'react';
import { reducer, initialState } from './reducer';

const API_URL = "http://localhost:3001/issues";
const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };

const statusStyles = {
  OPEN: "bg-blue-600 text-white",
  IN_PROGRESS: "bg-yellow-600 text-white",
  DONE: "bg-green-600 text-white"
};

const priorityStyles = {
  LOW: "bg-green-600 text-white",
  MEDIUM: "bg-orange-600 text-white",
  HIGH: "bg-red-600 text-white"
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};  


function IssueItem({ issue, updateStatus, deleteIssue }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-bold">{issue.title}</h3>
      <span className="text-[10px] text-gray-400 font-medium">
          {formatDate(issue.createdAt)}
      </span>
      <p className="text-gray-600 text-sm mb-3">{issue.description}</p>
     <div className="flex gap-2 mb-4">
                  <span className={`text-sm border rounded px-1 font-bold outline-none transition-colors ${statusStyles[issue.status]}`}>
                    {issue.status}
                  </span>
                  <span className={`text-[10px] font-bold ${priorityStyles[issue.priority]} px-2 py-1 rounded uppercase`}>
                    {issue.priority}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <select 
                    className={`text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded`}
                    value={issue.status}
                    onChange={(e) => updateStatus(issue.id, e.target.value)}
                  >
                    <option value="OPEN" className="text-black">OPEN</option>
                    <option value="IN_PROGRESS" className="text-black">IN_PROGRESS</option>
                    <option value="DONE" className="text-black">DONE</option>
                  </select>

        {!showConfirm ? ( 
          <button onClick={() => setShowConfirm(true)} className="text-red-500 text-sm font-bold hover:underline">Supprimer</button>
        ) : (
          <div className="flex items-center gap-2 animate-pulse">
            <span className="text-[10px] font-bold text-red-600">Vous êtes sûr ?</span>
            <button onClick={() => deleteIssue(issue.id)} className="bg-red-600 text-white text-[10px] px-2 py-1 rounded" >Oui</button>
            <button onClick={() => setShowConfirm(false)} className="text-gray-500 text-[10px] px-2 py-1"> Non</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [sortByPriority, setSortByPriority] = useState(false);

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

  useEffect(() => { fetchIssues(); }, []);

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

  const updateStatus = async (id, status) => {
    try {
      await fetch(API_URL + "/" + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
    } catch (err) {
      console.error("Erreur update:", err);
    }
  };

  const deleteIssue = async (id) => {
    try {
      const response = await fetch(API_URL + "/" + id, { method: 'DELETE' });
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
       <h1 className="text-4xl font-bebas font-bold tracking-widest text-gray-900 mb-8"> Issue Tracker </h1>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="font-bold mb-4 text-lg">Créer une issue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              className="w-full border-b border-blue-300 p-2 outline-none focus:border-blue-500"
              placeholder="Titre"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
            <textarea 
              className="w-full border border-blue-300 rounded-xl p-2 outline-none focus:border-blue-500 resize-none"
              placeholder="Décris le problème..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Priorité</label>
              <select 
                className={`text-sm rounded-lg px-2 py-1 font-bold ${priorityStyles[form.priority]}`}
                value={form.priority}
                onChange={e => setForm({...form, priority: e.target.value})}
              >
                <option value="LOW" className="text-black bg-white">LOW</option>
                <option value="MEDIUM" className="text-black bg-white">MEDIUM</option>
                <option value="HIGH" className="text-black bg-white">HIGH</option>
              </select>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Ajouter l'issue
            </button>
          </form>
        </div>

                
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">Issues ({state.issues.length})</h2>
          <div className="flex gap-2">
            {/* Tri */}
            <button 
              onClick={() => setSortByPriority(!sortByPriority)}
              className={`text-sm px-3 py-1 rounded font-medium transition-colors ${sortByPriority ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {sortByPriority ? "Trié par priorité ↑" : "Trier par priorité"}
            </button>
            <button onClick={fetchIssues} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
              Refresh
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {[...state.issues]
            .sort((a, b) => {
              if (!sortByPriority) return 0;
              return priorityOrder[b.priority] - priorityOrder[a.priority]; 
            })
            .map(issue => (
              <IssueItem 
                key={issue.id} 
                issue={issue} 
                updateStatus={updateStatus} 
                deleteIssue={deleteIssue} 
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}