import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
let issues = [
  { id: 1, title: "Exemple", description: "Bug de démonstration", status: "OPEN", priority: "MEDIUM", createdAt: new Date().toISOString() },
  { id: 2, title: "Exemple 2", description: "Bug de démonstration", status: "DONE", priority: "HIGH", createdAt: new Date().toISOString() },
  { id: 3, title: "Exemple 3", description: "Bug de démonstration", status: "IN_PROGRESS", priority: "LOW", createdAt: new Date().toISOString() }
];

app.get("/issues", (req, res) => {
  res.json(issues);
});

app.post("/issues", (req, res) => {
  const newIssue = {
    id: Date.now(), 
    ...req.body,    
    status: "OPEN",
    createdAt: new Date().toISOString()  
  };
  issues.push(newIssue); 
  res.status(201).json(newIssue);
});

app.patch("/issues/:id", (req, res) => {
  const id = Number(req.params.id); 
  const { status } = req.body;
  
  issues = issues.map(issue => 
    issue.id === id ? { ...issue, status } : issue
  );
  res.json({ id, status });
});

app.delete("/issues/:id", (req, res) => {
  const id = Number(req.params.id);
  issues = issues.filter(issue => issue.id !== id); 
  res.status(204).send(); 
});

app.listen(3001, () => console.log("API running on http://localhost:3001")); 