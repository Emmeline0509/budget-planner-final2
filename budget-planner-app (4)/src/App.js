import React, { useState, useEffect } from "react";
import { format, endOfMonth, differenceInDays } from "date-fns";

export default function App() {
  const [balance, setBalance] = useState(0);
  const [extraIncome, setExtraIncome] = useState(0);
  const [fixedIncomes, setFixedIncomes] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [customExpenses, setCustomExpenses] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [currentDate, setCurrentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newFixedName, setNewFixedName] = useState("");
  const [newFixedAmount, setNewFixedAmount] = useState("");
  const [newFixedIncomeName, setNewFixedIncomeName] = useState("");
  const [newFixedIncomeAmount, setNewFixedIncomeAmount] = useState("");

  useEffect(() => {
    const customStored = localStorage.getItem("customExpenses");
    const fixedStored = localStorage.getItem("fixedExpenses");
    const incomeStored = localStorage.getItem("fixedIncomes");
    if (customStored) setCustomExpenses(JSON.parse(customStored));
    if (fixedStored) setFixedExpenses(JSON.parse(fixedStored));
    if (incomeStored) setFixedIncomes(JSON.parse(incomeStored));
  }, []);

  useEffect(() => {
    localStorage.setItem("customExpenses", JSON.stringify(customExpenses));
  }, [customExpenses]);

  useEffect(() => {
    localStorage.setItem("fixedExpenses", JSON.stringify(fixedExpenses));
  }, [fixedExpenses]);

  useEffect(() => {
    localStorage.setItem("fixedIncomes", JSON.stringify(fixedIncomes));
  }, [fixedIncomes]);

  const allExpenses = [...fixedExpenses, ...customExpenses];
  const totalFixedIncome = fixedIncomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalAvailable = balance + extraIncome + totalFixedIncome;

  const handleCheckboxChange = (name) => {
    setSelectedExpenses((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  };

  const handleAdd = (setList, name, amount, resetName, resetAmount) => {
    if (!name || isNaN(parseFloat(amount))) return;
    const newEntry = { name, amount: parseFloat(amount) };
    setList((prev) => [...prev, newEntry]);
    resetName("");
    resetAmount("");
  };

  const handleDelete = (setList, name) => {
    setList((prev) => prev.filter((e) => e.name !== name));
    setSelectedExpenses((prev) => prev.filter((e) => e !== name));
  };

  const selectedTotal = selectedExpenses.reduce((sum, name) => {
    const exp = allExpenses.find((e) => e.name === name);
    return sum + (exp ? exp.amount : 0);
  }, 0);

  const remaining = totalAvailable - selectedTotal;
  const today = new Date(currentDate);
  const end = endOfMonth(today);
  const daysLeft = Math.max(differenceInDays(end, today) + 1, 0);
  const fullWeeks = Math.floor(daysLeft / 7);
  const extraDays = daysLeft % 7;
  const weeklyBudget = fullWeeks > 0 ? (remaining / daysLeft) * 7 : 0;
  const extraBudget = fullWeeks > 0 ? (remaining / daysLeft) * extraDays : remaining;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Budget Planner</h1>

      <label>Bedrag op rekening:</label>
      <input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} /><br/>

      <label>Extra inkomen:</label>
      <input type="number" value={extraIncome} onChange={(e) => setExtraIncome(Number(e.target.value))} /><br/>

      <label>Datum:</label>
      <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} /><br/>

      <h2>Vaste inkomens</h2>
      {fixedIncomes.map((inc) => (
        <div key={inc.name}>
          {inc.name} (€{inc.amount}) <button onClick={() => handleDelete(setFixedIncomes, inc.name)}>Verwijder</button>
        </div>
      ))}
      <input placeholder="Naam" value={newFixedIncomeName} onChange={(e) => setNewFixedIncomeName(e.target.value)} />
      <input type="number" placeholder="Bedrag" value={newFixedIncomeAmount} onChange={(e) => setNewFixedIncomeAmount(e.target.value)} />
      <button onClick={() => handleAdd(setFixedIncomes, newFixedIncomeName, newFixedIncomeAmount, setNewFixedIncomeName, setNewFixedIncomeAmount)}>Toevoegen</button>

      <h2>Uitgaven</h2>
      {allExpenses.map((exp) => (
        <div key={exp.name}>
          <input type="checkbox" checked={selectedExpenses.includes(exp.name)} onChange={() => handleCheckboxChange(exp.name)} />
          {exp.name} (€{exp.amount})
          <button onClick={() => handleDelete(exp.name in customExpenses ? setCustomExpenses : setFixedExpenses, exp.name)}>Verwijder</button>
        </div>
      ))}

      <h3>Nieuwe uitgave</h3>
      <input placeholder="Naam" value={newExpenseName} onChange={(e) => setNewExpenseName(e.target.value)} />
      <input type="number" placeholder="Bedrag" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} />
      <button onClick={() => handleAdd(setCustomExpenses, newExpenseName, newExpenseAmount, setNewExpenseName, setNewExpenseAmount)}>Toevoegen</button>

      <h3>Nieuwe vaste kost</h3>
      <input placeholder="Naam" value={newFixedName} onChange={(e) => setNewFixedName(e.target.value)} />
      <input type="number" placeholder="Bedrag" value={newFixedAmount} onChange={(e) => setNewFixedAmount(e.target.value)} />
      <button onClick={() => handleAdd(setFixedExpenses, newFixedName, newFixedAmount, setNewFixedName, setNewFixedAmount)}>Toevoegen</button>

      <hr/>
      <p><strong>Totaal beschikbaar:</strong> €{totalAvailable}</p>
      <p><strong>Totaal uitgaven:</strong> €{selectedTotal}</p>
      <p><strong>Overschot:</strong> €{remaining}</p>
      <p><strong>Dagen resterend:</strong> {daysLeft}</p>
      <p><strong>Wekelijks budget:</strong> €{weeklyBudget.toFixed(2)}</p>
      {extraDays > 0 && <p><strong>Extra {extraDays} dagen:</strong> €{extraBudget.toFixed(2)}</p>}
    </div>
  );
}
