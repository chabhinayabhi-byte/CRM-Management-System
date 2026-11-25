
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, ShoppingCart, User,
  Bell, Search, Moon, Sun, LogOut, Plus,
  Trash2, Edit, Download
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";

import * as XLSX from "xlsx";
import Login from "./Login";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("crmUser") || "null")
  );

  const [page, setPage] = useState("Dashboard");
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: ""
  });

  useEffect(() => {
    if (!user) return;

    const key = "crmData_" + user.email;
    const saved = JSON.parse(localStorage.getItem(key) || "{}");

    setCustomers(saved.customers || []);
    setSales(saved.sales || []);
    setReminders(saved.reminders || []);
  }, [user]);

  function saveData(c = customers, s = sales, r = reminders) {
    if (!user) return;

    localStorage.setItem(
      "crmData_" + user.email,
      JSON.stringify({
        customers: c,
        sales: s,
        reminders: r
      })
    );
  }

  function login(email, password) {
    const accounts = JSON.parse(
      localStorage.getItem("crmAccounts") || "[]"
    );

    const found = accounts.find(
      a => a.email.toLowerCase() === email.toLowerCase()
      && a.password === password
    );

    if (found) {
      localStorage.setItem("crmUser", JSON.stringify(found));
      setUser(found);
    } else {
      alert("Invalid email or password. Please register first.");
    }
  }

  function logout() {
    localStorage.removeItem("crmUser");
    setUser(null);
    setPage("Dashboard");
  }

  function addCustomer(e) {
    e.preventDefault();

    let updated;

    if (editing !== null) {
      updated = customers.map((c, i) =>
        i === editing ? { ...form, id: c.id } : c
      );
    } else {
      updated = [
        ...customers,
        { ...form, id: Date.now() }
      ];
    }

    setCustomers(updated);
    saveData(updated);

    setForm({ name: "", email: "", phone: "", company: "" });
    setEditing(null);
    setShowForm(false);
  }

  function editCustomer(customer) {
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company
    });

    setEditing(customers.indexOf(customer));
    setShowForm(true);
  }

  function deleteCustomer(id) {
    if (!window.confirm("Delete this customer?")) return;

    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveData(updated);
  }

  function addSale(e) {
    e.preventDefault();

    const updated = [
      ...sales,
      {
        id: Date.now(),
        product: e.target.product.value,
        amount: Number(e.target.amount.value),
        date: new Date().toLocaleDateString()
      }
    ];

    setSales(updated);
    saveData(customers, updated);
    e.target.reset();
  }

  function deleteSale(id) {
    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    saveData(customers, updated);
  }

  function addReminder(e) {
    e.preventDefault();

    const updated = [
      ...reminders,
      {
        id: Date.now(),
        title: e.target.title.value,
        date: e.target.date.value
      }
    ];

    setReminders(updated);
    saveData(customers, sales, updated);
    e.target.reset();
  }

  function deleteReminder(id) {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveData(customers, sales, updated);
  }

  function exportExcel() {
    const sheet = XLSX.utils.json_to_sheet(customers);
    const book = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(book, sheet, "Customers");
    XLSX.writeFile(book, "CRM_Customers.xlsx");
  }

  function exportPDF() {
    import("jspdf").then(({ default: jsPDF }) => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF();

        doc.text("CRM Customer Report", 14, 15);

        doc.autoTable({
          startY: 25,
          head: [["Name", "Email", "Phone", "Company"]],
          body: customers.map(c => [
            c.name, c.email, c.phone, c.company
          ])
        });

        doc.save("CRM_Customers.pdf");
      });
    });
  }

  if (!user) {
    return <Login onLogin={login} />;
  }

  const filtered = customers.filter(c =>
    `${c.name} ${c.email} ${c.phone} ${c.company}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalSales = sales.reduce(
    (sum, s) => sum + s.amount, 0
  );

  const navItems = [
    ["Dashboard", LayoutDashboard],
    ["Customers", Users],
    ["Sales", ShoppingCart],
    ["Reminders", Bell],
    ["Profile", User]
  ];

  return (
    <div className={dark ? "app dark" : "app"}>

      <aside className="sidebar">
        <h2>CRM<span>Pro</span></h2>
        <p className="menu-title">MAIN MENU</p>

        {navItems.map(([name, Icon]) => (
          <button
            key={name}
            className={page === name ? "nav active" : "nav"}
            onClick={() => {
              setPage(name);
              setShowForm(false);
            }}
          >
            <Icon size={19} /> {name}
          </button>
        ))}

        <button className="nav logout" onClick={logout}>
          <LogOut size={19} /> Logout
        </button>
      </aside>

      <main className="main">

        <header className="topbar">
          <div>
            <h2>{page}</h2>
            <p>Welcome back, {user.name}!</p>
          </div>

          <div className="top-actions">
            <button
              className="icon-btn"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun /> : <Moon />}
            </button>

            <span className="avatar">
              {user.name?.[0]?.toUpperCase()}
            </span>
          </div>
        </header>

        {page === "Dashboard" && (
          <>
            <div className="stats">
              <div className="stat">
                <Users />
                <p>Total Customers</p>
                <h2>{customers.length}</h2>
              </div>

              <div className="stat">
                <ShoppingCart />
                <p>Total Sales</p>
                <h2>₹{totalSales}</h2>
              </div>

              <div className="stat">
                <Bell />
                <p>Follow-ups</p>
                <h2>{reminders.length}</h2>
              </div>

              <div className="stat">
                <User />
                <p>Account Status</p>
                <h2>Active</h2>
              </div>
            </div>

            <section className="panel">
              <h3>Sales Overview</h3>

              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sales}>
                    <XAxis dataKey="product" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="amount"
                      fill="#635bff"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}

        {page === "Customers" && (
          <>
            <div className="toolbar">
              <div className="search">
                <Search />
                <input
                  placeholder="Search customers..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <button
                className="primary"
                onClick={() => {
                  setForm({
                    name: "", email: "", phone: "", company: ""
                  });
                  setEditing(null);
                  setShowForm(!showForm);
                }}
              >
                <Plus size={18} /> Add Customer
              </button>

              <button className="secondary" onClick={exportExcel}>
                <Download size={17} /> Excel
              </button>

              <button className="secondary" onClick={exportPDF}>
                <Download size={17} /> PDF
              </button>
            </div>

            {showForm && (
              <form className="panel form-grid" onSubmit={addCustomer}>
                <h3>
                  {editing !== null ? "Edit Customer" : "Add New Customer"}
                </h3>

                {["name", "email", "phone", "company"].map(field => (
                  <input
                    key={field}
                    required
                    type={field === "email" ? "email" : "text"}
                    placeholder={field.toUpperCase()}
                    value={form[field]}
                    onChange={e =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                  />
                ))}

                <button className="primary">
                  Save Customer
                </button>
              </form>
            )}

            <section className="panel table-wrap">
              <h3>Customer Records</h3>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Company</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.company}</td>

                      <td>
                        <button
                          className="small-btn"
                          onClick={() => editCustomer(c)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="small-btn danger"
                          onClick={() => deleteCustomer(c.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <p className="empty">No customers found.</p>
              )}
            </section>
          </>
        )}

        {page === "Sales" && (
          <>
            <form className="panel form-grid" onSubmit={addSale}>
              <h3>Add New Sale</h3>

              <input
                name="product"
                placeholder="Product or Service"
                required
              />

              <input
                name="amount"
                type="number"
                min="1"
                placeholder="Amount in ₹"
                required
              />

              <button className="primary">Add Sale</button>
            </form>

            <section className="panel table-wrap">
              <h3>Sales Records</h3>

              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.map(s => (
                    <tr key={s.id}>
                      <td>{s.product}</td>
                      <td>₹{s.amount}</td>
                      <td>{s.date}</td>
                      <td>
                        <button
                          className="small-btn danger"
                          onClick={() => deleteSale(s.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {page === "Reminders" && (
          <>
            <form className="panel form-grid" onSubmit={addReminder}>
              <h3>Create Follow-up Reminder</h3>

              <input
                name="title"
                placeholder="Reminder details"
                required
              />

              <input
                name="date"
                type="date"
                required
              />

              <button className="primary">Add Reminder</button>
            </form>

            <section className="panel">
              <h3>Your Reminders</h3>

              {reminders.map(r => (
                <div className="reminder" key={r.id}>
                  <Bell />

                  <div>
                    <b>{r.title}</b>
                    <p>{r.date}</p>
                  </div>

                  <button
                    className="small-btn danger"
                    onClick={() => deleteReminder(r.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {reminders.length === 0 && <p>No reminders yet.</p>}
            </section>
          </>
        )}

        {page === "Profile" && (
          <section className="panel profile">
            <div className="avatar large">
              {user.name?.[0]?.toUpperCase()}
            </div>

            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <p>CRM User Account</p>

            <button className="primary" onClick={logout}>
              Logout
            </button>
          </section>
        )}

      </main>
    </div>
  );
}
