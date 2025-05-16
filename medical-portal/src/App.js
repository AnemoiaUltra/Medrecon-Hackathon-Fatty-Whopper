import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useParams } from 'react-router-dom';
import './buttons.css';

const Navbar = ({ mode, setMode }) => {
  const navigate = useNavigate();
  return (
    <div className="navbar">
      <div
        className="navbar-logo"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        onClick={() => navigate('/')}
      >
        <img src="/logo.png" alt="Logo" width="80px" height="80px" />
        <span>KODIRO</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ textTransform: 'uppercase', color: '#dafddd' }}>Patient</span>
        <div
          className="toggle-switch"
          onClick={() => {
            setMode(mode === 'doctor' ? 'patient' : 'doctor');
            navigate('/');
          }}
        >
          <div className={`toggle-thumb ${mode}`} />
        </div>
        <span style={{ textTransform: 'uppercase', color: '#dafddd' }}>Doctor</span>
      </div>
    </div>
  );
};

const AuthPage = ({ mode }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = () => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (isLogin) {
      if (users[form.username]?.password === form.password && users[form.username]?.role === mode) {
        localStorage.setItem('currentUser', JSON.stringify(users[form.username]));
        navigate(mode === 'patient' ? '/patient-dashboard' : '/doctor-search');
      } else {
        alert('Invalid credentials or role.');
      }
    } else {
      if (users[form.username]) {
        alert('Username already exists.');
        return;
      }
      users[form.username] = { ...form, role: mode, fields: [[], [], [], [], [], [], []] };
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(users[form.username]));
      navigate(mode === 'patient' ? '/patient-dashboard' : '/doctor-search');
    }
  };

  return (
    <div className="login">
      <h2>{`${mode.charAt(0).toUpperCase() + mode.slice(1)} ${isLogin ? 'Login' : 'Register'}`}</h2>
      <div className="login">
        <input placeholder="Username" onChange={e => setForm({ ...form, username: e.target.value })} />
        <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
        <button onClick={handleSubmit}>{isLogin ? 'Login' : 'Register'}</button>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Switch to Register' : 'Switch to Login'}
        </button>
      </div>
    </div>
  );
};

const PatientDashboard = () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const navigate = useNavigate();

  const fieldNames = [
    "History",
    "Medical Orders",
    "Prescribed Medications (Current & Old)",
    "Make Doctor Appointment",
    "Make a Reminder",
    "Patient Parameters",
    "Other Info"
  ];

  return (
    <div className="p-4">
      <h2 style={{ textAlign: 'center', textTransform: 'uppercase', color: '#263238' }}>Patient Dashboard</h2>
      <div className="button-grid">
        {user.fields.map((_, i) => (
          <button
            key={i}
            className="dashboard-button"
            onClick={() => navigate(`/view-field/${i}`)}
          >
            {fieldNames[i] || `Field ${i + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
};

const DoctorSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const handleSearch = () => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[query]?.role === 'patient') {
      localStorage.setItem('selectedPatient', JSON.stringify(users[query]));
      navigate('/doctor-dashboard');
    } else {
      alert('Patient not found.');
    }
  };
  return (
    <div className="p-4">
      <h2 style={{ textAlign: 'center', color: '#263238' }}>Search Patient:</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSearch();
        }}
        className="doctor-search-form"
      >
        <input
          className="doctor-search-input"
          placeholder="Enter patient username"
          onChange={e => setQuery(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="submit" className="doctor-search-button">
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

const DoctorDashboard = () => {
  const [patient, setPatient] = useState(JSON.parse(localStorage.getItem('selectedPatient')));
  const navigate = useNavigate();

  const fieldNames = [
    "Access to All Patient History",
    "Write Medical Order",
    "Write Prescription",
    "Write Medical Report",
    "Other Info",
    "Share"
  ];

  return (
    <div className="p-4">
      <h2 style={{ textAlign: 'center', textTransform: 'uppercase', color: '#263238' }}>
        Doctor View of Patient: {patient.username}
      </h2>
      <div className="button-grid">
        {fieldNames.map((name, i) => (
          name === "Share" ? (
            <button
              key={i}
              className="dashboard-button"
              onClick={() => navigate('/share')}
            >
              {name}
            </button>
          ) : (
            <button
              key={i}
              className="dashboard-button"
              onClick={() => navigate(`/edit-field/${i}`)}
            >
              {name}
            </button>
          )
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/doctor-search')}>
          Back
        </button>
      </div>
    </div>
  );
};

const EditField = ({ fieldIndex }) => {
  const fieldNames = [
    "Access to All Patient History",
    "Write Medical Order",
    "Write Prescription",
    "Write Medical Report",
    "Other Info"
  ];
  const [patient, setPatient] = useState(JSON.parse(localStorage.getItem('selectedPatient')));
  const navigate = useNavigate();

  const [bodyWeight, setBodyWeight] = useState('');
  const [bodyHeight, setBodyHeight] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [sugarLevels, setSugarLevels] = useState('');

  let cleanedField = Array.isArray(patient.fields[fieldIndex]) ? patient.fields[fieldIndex].filter(entry => entry && entry.trim() !== '') : [];
  patient.fields[fieldIndex] = cleanedField;
  localStorage.setItem('selectedPatient', JSON.stringify(patient));
  const fieldHistory = cleanedField;
  const [value, setValue] = useState(fieldHistory.length > 0 ? fieldHistory[fieldHistory.length - 1] : '');

  useEffect(() => {
    if (fieldIndex === 4) {
      const otherObj = patient.fields[4];
      if (otherObj && typeof otherObj === 'object' && !Array.isArray(otherObj)) {
        setBodyWeight(otherObj.bodyWeight || '');
        setBodyHeight(otherObj.bodyHeight || '');
        setBloodPressure(otherObj.bloodPressure || '');
        setSugarLevels(otherObj.sugarLevels || '');
      } else {
        setBodyWeight('');
        setBodyHeight('');
        setBloodPressure('');
        setSugarLevels('');
      }
    }
  }, [fieldIndex]);

  const saveOtherField = () => {
    const users = JSON.parse(localStorage.getItem('users'));
    users[patient.username].fields[4] = {
      bodyWeight,
      bodyHeight,
      bloodPressure,
      sugarLevels
    };
    const summary = `Body Weight: ${bodyWeight}, Body Height: ${bodyHeight}, Blood Pressure: ${bloodPressure}, Sugar Levels: ${sugarLevels}`;
    let history = users[patient.username].fields[0];
    history = history.filter(entry => typeof entry === 'string' && entry.trim() !== '');
    if (history.length === 0 || history[history.length - 1] !== summary) {
      history.push(summary);
    }
    users[patient.username].fields[0] = history;

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('selectedPatient', JSON.stringify(users[patient.username]));
    if (localStorage.getItem('currentUser') && JSON.parse(localStorage.getItem('currentUser')).username === patient.username) {
      localStorage.setItem('currentUser', JSON.stringify(users[patient.username]));
    }
    navigate('/doctor-dashboard');
  };

  const saveField = () => {
    const users = JSON.parse(localStorage.getItem('users'));
    let fieldData = users[patient.username].fields[fieldIndex];
    if (!Array.isArray(fieldData)) {
      fieldData = fieldData ? [fieldData] : [];
    }
    fieldData.push(value);
    fieldData = fieldData.filter(entry => entry && entry.trim() !== '');
    users[patient.username].fields[fieldIndex] = fieldData;
    users[patient.username].fields[fieldIndex] = fieldData.filter(entry => entry.trim() !== '');
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('selectedPatient', JSON.stringify(users[patient.username]));
    if (localStorage.getItem('currentUser') && JSON.parse(localStorage.getItem('currentUser')).username === patient.username) {
      localStorage.setItem('currentUser', JSON.stringify(users[patient.username]));
    }
    navigate('/doctor-dashboard');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', color: '#263238', textAlign: 'center' }}>
      <h2>
        {`${fieldNames[fieldIndex] || `Field ${fieldIndex + 1}`} for ${patient.username}`}
      </h2>
      <div>
        {fieldIndex === 0 ? (
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto', color: 'inherit' }}>
            {patient.fields.flat().map((entry, idx) => {
              if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
                return (
                  <li key={idx}>
                    {`Body Weight: ${entry.bodyWeight || '-'} kg, Body Height: ${entry.bodyHeight || '-'} cm, Blood Pressure: ${entry.bloodPressure || '-'}, Sugar Levels: ${entry.sugarLevels || '-'}`}
                  </li>
                );
              }
              return <li key={idx}>{entry}</li>;
            })}
          </ul>
        ) : fieldIndex === 4 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Body Weight:
              <input
                type="text"
                value={bodyWeight}
                onChange={e => setBodyWeight(e.target.value)}
                style={{
                  border: '2px solid #77A58A',
                  backgroundColor: '#dafddd',
                  borderRadius: '6px',
                  padding: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginTop: '4px'
                }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Body Height:
              <input
                type="text"
                value={bodyHeight}
                onChange={e => setBodyHeight(e.target.value)}
                style={{
                  border: '2px solid #77A58A',
                  backgroundColor: '#dafddd',
                  borderRadius: '6px',
                  padding: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginTop: '4px'
                }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Blood Pressure:
              <input
                type="text"
                value={bloodPressure}
                onChange={e => setBloodPressure(e.target.value)}
                style={{
                  border: '2px solid #77A58A',
                  backgroundColor: '#dafddd',
                  borderRadius: '6px',
                  padding: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginTop: '4px'
                }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Sugar Levels:
              <input
                type="text"
                value={sugarLevels}
                onChange={e => setSugarLevels(e.target.value)}
                style={{
                  border: '2px solid #77A58A',
                  backgroundColor: '#dafddd',
                  borderRadius: '6px',
                  padding: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginTop: '4px'
                }}
              />
            </label>
            <button
              onClick={saveOtherField}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                cursor: 'pointer',
                borderRadius: '6px',
                backgroundColor: '#77A58A',
                color: 'white',
                border: 'none'
              }}
            >
              Save
            </button>
          </div>
        ) : (
          fieldHistory.length > 0 ? (
            <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto', color: 'inherit' }}>
              {fieldHistory.map((entry, idx) => (
                <li key={idx}>{entry}</li>
              ))}
            </ul>
          ) : (
            <p>No entries</p>
          )
        )}
      </div>
      {fieldIndex !== 0 && fieldIndex !== 4 && (
        <>
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{
              border: '2px solid #77A58A',
              backgroundColor: '#dafddd',
              borderRadius: '6px',
              padding: '8px',
              width: '100%',
              boxSizing: 'border-box',
              marginTop: '10px',
              minHeight: '120px',
              resize: 'vertical'
            }}
          />
          <button
            onClick={saveField}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '6px',
              backgroundColor: '#77A58A',
              color: 'white',
              border: 'none'
            }}
          >
            Save
          </button>
        </>
      )}
      <button
        onClick={() => navigate('/doctor-dashboard')}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          cursor: 'pointer',
          borderRadius: '6px',
          backgroundColor: '#77A58A',
          color: 'white',
          border: 'none'
        }}
      >
        Back
      </button>
    </div>
  );
};

const Share = () => {
  const navigate = useNavigate();
  const [sharedTo, setSharedTo] = useState('');
  const currentDoctor = JSON.parse(localStorage.getItem('currentUser'));
  const sharedPatients = JSON.parse(localStorage.getItem('sharedPatients') || '{}');
  const [received, setReceived] = useState([]);

  useEffect(() => {
    setReceived(sharedPatients[currentDoctor.username] || []);
  }, []);

  const handleShare = () => {
    const selectedPatient = JSON.parse(localStorage.getItem('selectedPatient'));
    if (!selectedPatient) return alert('No patient selected to share.');
    const targetDoctor = sharedTo.trim();
    const allUsers = JSON.parse(localStorage.getItem('users') || '{}');

    if (!allUsers[targetDoctor] || allUsers[targetDoctor].role !== 'doctor') {
      return alert('Doctor not found.');
    }

    const shared = JSON.parse(localStorage.getItem('sharedPatients') || '{}');
    if (!shared[targetDoctor]) shared[targetDoctor] = [];

    const alreadyShared = shared[targetDoctor].some(
      p => p.username === selectedPatient.username
    );

    if (!alreadyShared) {
      shared[targetDoctor].push(selectedPatient);
      localStorage.setItem('sharedPatients', JSON.stringify(shared));
      alert('Patient shared successfully.');
    } else {
      alert('This patient is already shared with that doctor.');
    }
  };

  const openSharedPatient = (patient) => {
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
    navigate('/doctor-dashboard');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', color: '#263238', textAlign: 'center' }}>
      <h2>Share Patient</h2>
      <input
        placeholder="Enter Doctor Username"
        value={sharedTo}
        onChange={e => setSharedTo(e.target.value)}
        className="doctor-search-input"
      />
      <button onClick={handleShare} className="doctor-search-button" style={{ marginTop: '10px' }}>
        Share Selected Patient
      </button>

      <h3 style={{ marginTop: '30px' }}>Received Shared Patients</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {received.map((patient, idx) => (
          <li key={idx} style={{ marginBottom: '10px' }}>
            <button
              className="dashboard-button"
              onClick={() => openSharedPatient(patient)}
            >
              {patient.username}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => navigate('/doctor-dashboard')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          cursor: 'pointer',
          borderRadius: '6px',
          backgroundColor: '#77A58A',
          color: 'white',
          border: 'none'
        }}
      >
        Back
      </button>
    </div>
  );
};

const App = () => {
  const [mode, setMode] = useState('patient');

  return (
    <Router>
      <Navbar mode={mode} setMode={setMode} />
      <Routes>
        <Route path="/" element={<AuthPage mode={mode} />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-search" element={<DoctorSearch />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/edit-field/:fieldIndex" element={<EditFieldWrapper />} />
        <Route path="/view-field/:fieldIndex" element={<ViewFieldWrapper />} />
        <Route path="/share" element={<Share />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const EditFieldWrapper = () => {
  const { fieldIndex } = useParams();
  return <EditField fieldIndex={parseInt(fieldIndex, 10)} />;
};

const ViewField = ({ fieldIndex }) => {
  const fieldNames = [
    "History",
    "Medical Orders",
    "Prescribed Medications (Current & Old)",
    "Make Doctor Appointment",
    "Make a Reminder",
    "Patient Parameters",
    "Other Info"
  ];
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [bodyWeight, setBodyWeight] = useState('');
  const [bodyHeight, setBodyHeight] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [sugarLevels, setSugarLevels] = useState('');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const cleanedFields = currentUser.fields.map(field =>
      Array.isArray(field) ? field.filter(entry => entry && entry.trim() !== '') : field
    );
    currentUser.fields = cleanedFields;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    setUser(currentUser);

    if (fieldIndex === 6) {
      const otherInfo = currentUser.fields[6];
      if (otherInfo && typeof otherInfo === 'object' && !Array.isArray(otherInfo)) {
        setBodyWeight(otherInfo.bodyWeight || '');
        setBodyHeight(otherInfo.bodyHeight || '');
        setBloodPressure(otherInfo.bloodPressure || '');
        setSugarLevels(otherInfo.sugarLevels || '');
      } else {
        setBodyWeight('');
        setBodyHeight('');
        setBloodPressure('');
        setSugarLevels('');
      }
    }
  }, [fieldIndex]);

  const saveOtherInfo = () => {
    if (!user) return;
    const updatedUser = { ...user };
    updatedUser.fields = [...updatedUser.fields];
    updatedUser.fields[6] = {
      bodyWeight,
      bodyHeight,
      bloodPressure,
      sugarLevels
    };
    const summary = `Body Weight: ${bodyWeight}, Body Height: ${bodyHeight}, Blood Pressure: ${bloodPressure}, Sugar Levels: ${sugarLevels}`;
    let history = updatedUser.fields[0];
    history = history.filter(entry => typeof entry === 'string' && entry.trim() !== '');
    if (history.length === 0 || history[history.length - 1] !== summary) {
      history.push(summary);
    }
    updatedUser.fields[0] = history;

    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[updatedUser.username]) {
      users[updatedUser.username].fields = updatedUser.fields;
      localStorage.setItem('users', JSON.stringify(users));
    }
    alert('Other Info saved.');
  };

  if (!user) {
    return <div className="p-4">No patient user found.</div>;
  }
  const history = user.fields && user.fields[fieldIndex];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', color: '#263238', textAlign: 'center' }}>
      <h2>{fieldNames[fieldIndex] || `Field ${fieldIndex + 1}`}</h2>
      {parseInt(fieldIndex) === 6 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Body Weight:
            <input
              type="text"
              value={bodyWeight}
              onChange={e => setBodyWeight(e.target.value)}
              style={{
                border: '2px solid #77A58A',
                backgroundColor: '#dafddd',
                borderRadius: '6px',
                padding: '8px',
                width: '100%',
                boxSizing: 'border-box',
                marginTop: '4px'
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Body Height:
            <input
              type="text"
              value={bodyHeight}
              onChange={e => setBodyHeight(e.target.value)}
              style={{
                border: '2px solid #77A58A',
                backgroundColor: '#dafddd',
                borderRadius: '6px',
                padding: '8px',
                width: '100%',
                boxSizing: 'border-box',
                marginTop: '4px'
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Blood Pressure:
            <input
              type="text"
              value={bloodPressure}
              onChange={e => setBloodPressure(e.target.value)}
              style={{
                border: '2px solid #77A58A',
                backgroundColor: '#dafddd',
                borderRadius: '6px',
                padding: '8px',
                width: '100%',
                boxSizing: 'border-box',
                marginTop: '4px'
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Sugar Levels:
            <input
              type="text"
              value={sugarLevels}
              onChange={e => setSugarLevels(e.target.value)}
              style={{
                border: '2px solid #77A58A',
                backgroundColor: '#dafddd',
                borderRadius: '6px',
                padding: '8px',
                width: '100%',
                boxSizing: 'border-box',
                marginTop: '4px'
              }}
            />
          </label>
          <button
            onClick={saveOtherInfo}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '6px',
              backgroundColor: '#77A58A',
              color: 'white',
              border: 'none'
            }}
          >
            Save
          </button>
        </div>
      ) : parseInt(fieldIndex) === 0 ? (
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto', color: '#263238' }}>
          {user.fields.flat().map((entry, idx) => {
            if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
              return (
                <li key={idx}>
                  {`Body Weight: ${entry.bodyWeight || '-'} kg, Body Height: ${entry.bodyHeight || '-'} cm, Blood Pressure: ${entry.bloodPressure || '-'}, Sugar Levels: ${entry.sugarLevels || '-'}`}
                </li>
              );
            }
            return <li key={idx}>{entry}</li>;
          })}
        </ul>
      ) : (
        history && history.length > 0 ? (
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto', color: '#263238' }}>
            {history.map((entry, idx) => (
              <li key={idx}>{entry}</li>
            ))}
          </ul>
        ) : (
          <p>No entries</p>
        )
      )}
      <button onClick={() => navigate('/patient-dashboard')} style={{ marginTop: '20px' }}>
        Back
      </button>
    </div>
  );
};

const ViewFieldWrapper = () => {
  const { fieldIndex } = useParams();
  return <ViewField fieldIndex={parseInt(fieldIndex, 10)} />;
};

export default App;