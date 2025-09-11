import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DataChart from './DataChart';
import './App.css';
import Login from './Login';
import FileManagementModal from './FileManagementModal';
import UserManagementModal from './UserManagementModal';
import { authService } from './auth';

// A helper function to categorize the series keys
const categorizeSeries = (keys) => {
  const categories = {
    przychody: [],
    koszty_zabezpieczone: [],
    koszty_rzeczywiste: [],
    roznice: [],
  };

  keys.forEach(key => {
    // Normalizacja klucza dla lepszego dopasowania
    const normalizedKey = key.toLowerCase()
                             .replace(/ą/g, 'a')
                             .replace(/ć/g, 'c')
                             .replace(/ę/g, 'e')
                             .replace(/ł/g, 'l')
                             .replace(/ń/g, 'n')
                             .replace(/ó/g, 'o')
                             .replace(/ś/g, 's')
                             .replace(/ź/g, 'z')
                             .replace(/ż/g, 'z');

    if (normalizedKey.includes('roznica')) {
      categories.roznice.push(key);
    } else if (normalizedKey.includes('przychody')) {
      categories.przychody.push(key);
    } else if (normalizedKey.includes('koszty_zabezpieczone')) {
      categories.koszty_zabezpieczone.push(key);
    } else if (normalizedKey.includes('koszty_rzeczywiste')) {
      categories.koszty_rzeczywiste.push(key);
    }
  });

  return categories;
};

// A helper function to format the display name of a series key
const formatSeriesName = (key) => {
  let formattedName = key;
  formattedName = formattedName.replace(/przychody_zewnetrzne/g, 'Przychody zewnętrzne');
  formattedName = formattedName.replace(/suma_zabezpieczone/g, 'Koszty zabezpieczone');
  formattedName = formattedName.replace(/suma_rzeczywiste/g, 'Koszty rzeczywiste');
  formattedName = formattedName.replace(/różnica_przychody_zewnętrzne_minus_koszty_rzeczywiste/g, 'Różnica: Przychody - Koszty Rzeczywiste');
  formattedName = formattedName.replace(/różnica_koszty_zabezpieczone_suma_minus_koszty_rzeczywiste/g, 'Różnica: Koszty Zabezpieczone - Koszty Rzeczywiste');
  formattedName = formattedName.replace(/w_miesiacu/g, 'w miesiącu');
  formattedName = formattedName.replace(/skumulowane/g, 'skumulowane');
  formattedName = formattedName.replace(/dzialowe/g, 'działowe');
  formattedName = formattedName.replace(/nie_dzialowe/g, 'niedziałowe');
  formattedName = formattedName.replace(/_R_KWND/g, ' (R_KWND)');
  formattedName = formattedName.replace(/_R_KZD_O/g, ' (R_KZD_O)');
  formattedName = formattedName.replace(/_R_KZD_N/g, ' (R_KZD_N)');
  formattedName = formattedName.replace(/_PZD/g, '');
  formattedName = formattedName.replace(/_Z_KWDP/g, '');
  formattedName = formattedName.replace(/_Z_KWNP/g, '');
  formattedName = formattedName.replace(/_Z_KZP/g, '');
  formattedName = formattedName.replace(/_PZ/g, '');
  formattedName = formattedName.replace(/_o_przychody_wewnetrzne/g, ' o przychody wewnętrzne');
  formattedName = formattedName.replace(/przychody_wewnetrzne/g, 'Przychody wewnętrzne');
  formattedName = formattedName.replace(/suma/g, 'Suma');
  formattedName = formattedName.replace(/wyplacone/g, 'wypłacone');
  formattedName = formattedName.replace(/estymowane/g, 'estymowane');
  
  // Usunięcie zbędnych znaków i dodatkowe spacje
  formattedName = formattedName.replace(/  +/g, ' '); // Wiele spacji na jedną
  formattedName = formattedName.replace(/_/g, ' '); // Zamiana pozostałych podkreślników na spacje
  formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1); // Upewnienie się, że pierwsza litera jest duża
  
  return formattedName;
};

// Funkcja pomocnicza do formatowania nazw kluczy dla wyświetlania w tabeli
const formatKeyName = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/zabezpieczone/g, 'zabezpieczone')
    .replace(/rzeczywiste/g, 'rzeczywiste')
    .replace(/wewnetrzne/g, 'wewnętrzne')
    .replace(/zewnetrzne/g, 'zewnętrzne')
    .replace(/przychody/g, 'przychody')
    .replace(/lista projektow/g, 'lista projektów')
    .replace(/poczatek/g, 'początek')
    .replace(/koniec/g, 'koniec')
    .replace(/czas trwania w miesiacach/g, 'czas trwania (mies.)')
    .replace(/wspolczynnik/g, 'współczynnik')
    .replace(/dzialowe/g, 'działowe')
    .replace(/nie dzialowe/g, 'niedziałowe')
    .replace(/suma/g, 'suma')
    .replace(/zabepieczone/g, 'zabezpieczone')
    .replace(/zysk/g, 'zysk')
    .replace(/koszty stale/g, 'koszty stałe')
    .replace(/oplacone/g, 'opłacone')
    .replace(/niezafakturowane/g, 'niezafakturowane')
    .replace(/wewnetrzne/g, 'wewnętrzne')
    .replace(/wyplacone/g, 'wypłacone')
    .replace(/estymowane/g, 'estymowane')
    .replace(/analizowana liczba miesiecy/g, 'liczba miesięcy')
    .replace(/nazwa dzialu/g, 'nazwa działu')
    .replace(/pierwszy miesiac/g, 'pierwszy miesiąc')
    .replace(/ostatni miesiac/g, 'ostatni miesiąc')
    .replace(/dzial/g, 'dział')
    .replace(/nazwa projektu/g, 'nazwa projektu')
    .replace(/wydatki wewnetrzne niedzialowe/g, 'wydatki wewn. niedziałowe')
    .replace(/\b(współczynnik)\b/i, 'współczynnik');
};


// Komponent do wyświetlania tabeli podsumowującej
const SummaryTable = ({ data, title }) => {
  if (!data) return null;

  const tableData = Object.entries(data).filter(([key]) => key !== 'lista projektów');
  const projectList = data['lista projektów'];

  return (
    <div className="chart-section summary-table-container">
      <h2>podsumowanie finansowe: {title}</h2>
      <table className="summary-table">
        <tbody>
          {tableData.map(([key, value]) => (
            <tr key={key}>
              <td className="summary-key">{formatKeyName(key)}:</td>
              <td className="summary-value">
                {typeof value === 'number'
                  ? (key.includes('wspolczynnik') || key.includes('współczynnik'))
                    ? `${(value * 100).toFixed(2)}%`
                    : (key === 'analizowana liczna miesi\u0119cy' || key === 'czas trwania w miesi\u0105cach')
                      ? Math.round(value)
                      : `${value.toFixed(2)} PLN`
                  : value
                }
              </td>
            </tr>
          ))}
          {projectList && projectList.length > 0 && (
            <tr>
              <td className="summary-key">{formatKeyName('lista projektów')}:</td>
              <td className="summary-value">
                <ul>
                  {projectList.map((project, index) => (
                    <li key={index}>{project}</li>
                  ))}
                </ul>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Nowa funkcja do agregowania danych z wielu działów
const aggregateData = (selectedKeys, allData) => {
  if (selectedKeys.length === 0) return [];
  if (selectedKeys.length === 1) return allData[selectedKeys[0]];

  const aggregatedData = [];
  const firstKey = selectedKeys[0];
  const months = allData[firstKey].map(item => item.LMD);
  
  months.forEach(month => {
    const aggregatedMonthData = { LMD: month };
    Object.keys(allData[firstKey][0]).forEach(key => {
      if (key !== 'LMD' && key !== 'nazwa_dzialu' && key !== 'LMP') {
        const sum = selectedKeys.reduce((total, departmentKey) => {
          const departmentDataForMonth = allData[departmentKey].find(d => d.LMD === month);
          return total + (departmentDataForMonth ? departmentDataForMonth[key] : 0);
        }, 0);
        aggregatedMonthData[key] = sum;
      }
    });
    aggregatedData.push(aggregatedMonthData);
  });

  return aggregatedData;
};

// Poprawiona funkcja do agregowania danych podsumowujących
const aggregateSummaryData = (selectedKeys, allSummaryData) => {
  if (selectedKeys.length === 0) return null;
  if (selectedKeys.length === 1) return allSummaryData[selectedKeys[0]];

  const aggregatedSummary = {
    'nazwa dzialu': selectedKeys.join(', '),
    'lista projektów': [],
  };

  const allNumericKeys = new Set();
  const allProjectLists = [];

  selectedKeys.forEach(key => {
    const summary = allSummaryData[key];
    if (summary) {
      Object.keys(summary).forEach(summaryKey => {
        if (typeof summary[summaryKey] === 'number') {
          allNumericKeys.add(summaryKey);
        } else if (summaryKey === 'lista projektów') {
          allProjectLists.push(summary[summaryKey]);
        }
      });
    }
  });

  allNumericKeys.forEach(key => {
    aggregatedSummary[key] = 0;
    selectedKeys.forEach(departmentKey => {
      const summary = allSummaryData[departmentKey];
      if (summary && summary[key] !== undefined) {
        aggregatedSummary[key] += summary[key];
      }
    });
  });

  aggregatedSummary['lista projektów'] = allProjectLists.flat();

  // Uśrednienie współczynnika zysku
  if (aggregatedSummary['wspolczynnik'] !== undefined && selectedKeys.length > 0) {
    aggregatedSummary['wspolczynnik'] /= selectedKeys.length;
  }
  
  // Zaktualizowanie nazw dla zagregowanego podsumowania
  const finalSummary = {};
  Object.keys(aggregatedSummary).forEach(key => {
    finalSummary[formatKeyName(key)] = aggregatedSummary[key];
  });
  
  return finalSummary;
};


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showFileManagementModal, setShowFileManagementModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  
  const [dzialyDataFull, setDzialyDataFull] = useState({});
  const [projektyDataFull, setProjektyDataFull] = useState({});
  const [dzialyDataShort, setDzialyDataShort] = useState({});
  const [projektyDataShort, setProjektyDataShort] = useState({});
  
  // Nowe stany dla danych podsumowujących
  const [projektySumy, setProjektySumy] = useState({});
  const [dzialySumy, setDzialySumy] = useState({});
  
  // Nowe stany dla agregacji
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [aggregatedDataFull, setAggregatedDataFull] = useState(null);
  const [aggregatedDataShort, setAggregatedDataShort] = useState(null);
  const [aggregatedSummary, setAggregatedSummary] = useState(null);
  
  const [isMultiSelectEnabled, setIsMultiSelectEnabled] = useState(false);

  const [loading, setLoading] = useState(true);

  const [dataType, setDataType] = useState('projects');
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState([]);
  const sidebarRef = useRef(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  
  // Nowa funkcja do ładowania danych
  const loadData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/projekty_data.json').then(res => res.data).catch(() => ({})),
      axios.get('/dzialy_data.json').then(res => res.data).catch(() => ({})),
      axios.get('/projekty_data_short.json').then(res => res.data).catch(() => ({})),
      axios.get('/dzialy_data_short.json').then(res => res.data).catch(() => ({})),
      axios.get('/projekty_sumy.json').then(res => res.data).catch(() => ({})),
      axios.get('/dzialy_sumy.json').then(res => res.data).catch(() => ({}))
    ])
    .then(([projectsFull, departmentsFull, projectsShort, departmentsShort, projectsSummary, departmentsSummary]) => {
      setProjektyDataFull(projectsFull);
      setDzialyDataFull(departmentsFull);
      setProjektyDataShort(projectsShort);
      setDzialyDataShort(departmentsShort);
      
      setProjektySumy(projectsSummary);
      setDzialySumy(departmentsSummary);

      const initialKeys = Object.keys(projectsFull);
      if (initialKeys.length > 0) {
        setSelectedKey(initialKeys[0]);
      } else {
        setSelectedKey(null);
      }
      setLoading(false);
    })
    .catch(error => {
      console.error("Failed to fetch data:", error);
      setLoading(false);
    });
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setIsAdmin(user.role === 'admin');
      loadData();
    }
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    if (sidebarRef.current) {
      const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth > 200) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleDataTypeChange = (event) => {
    const newDataType = event.target.value;
    setDataType(newDataType);
    if (newDataType === 'departments') {
      setIsMultiSelectEnabled(false);
      setSelectedKey(Object.keys(dzialyDataFull)[0]);
      setSelectedDepartments([]);
      setAggregatedDataFull(null);
      setAggregatedDataShort(null);
      setAggregatedSummary(null);
    } else {
      const newKeys = Object.keys(projektyDataFull);
      setSelectedKey(newKeys.length > 0 ? newKeys[0] : null);
    }
    setSelectedSeries([]);
  };

  const handleKeyChange = (event) => {
    const newSelectedKey = event.target.value;
    setSelectedKey(newSelectedKey);
    // Ustawienie domyślnych serii dla działów, gdy wybierany jest nowy klucz
    if (dataType === 'departments') {
      setSelectedSeries([
        'przychody_zewnetrzne_skumulowane',
        'koszty_rzeczywiste_suma_skumulowane',
        'koszty_zabezpieczone_suma_skumulowane'
      ]);
    } else {
      setSelectedSeries([]);
    }
    // Wyczyść dane agregowane, jeśli przełączamy się na pojedynczy widok
    setAggregatedDataFull(null);
    setAggregatedDataShort(null);
    setAggregatedSummary(null);
  };
  
  const handleMultiSelectToggle = (event) => {
    const isChecked = event.target.checked;
    setIsMultiSelectEnabled(isChecked);
    if (isChecked) {
      setSelectedKey(null);
    } else {
      setSelectedKey(Object.keys(dzialyDataFull)[0]);
      setSelectedDepartments([]);
      setAggregatedDataFull(null);
      setAggregatedDataShort(null);
      setAggregatedSummary(null);
    }
  };

  const handleDepartmentSelection = (event) => {
    const { value, checked } = event.target;
    setSelectedDepartments(prevDepartments =>
      checked ? [...prevDepartments, value] : prevDepartments.filter(dep => dep !== value)
    );
  };

  const handleSelectAll = () => {
    const allDepartments = Object.keys(dzialyDataFull);
    setSelectedDepartments(allDepartments);
  };
  
  const handleAggregate = () => {
    if (selectedDepartments.length < 2) return;
    setLoading(true);
    
    const aggregatedFull = aggregateData(selectedDepartments, dzialyDataFull);
    const aggregatedShort = aggregateData(selectedDepartments, dzialyDataShort);
    const aggregatedSum = aggregateSummaryData(selectedDepartments, dzialySumy);
    
    setAggregatedDataFull(aggregatedFull);
    setAggregatedDataShort(aggregatedShort);
    setAggregatedSummary(aggregatedSum);
    
    setLoading(false);
    // Ustawienie domyślnych serii dla agregowanych danych
    setSelectedSeries([
      'przychody_zewnetrzne_skumulowane',
      'koszty_rzeczywiste_suma_skumulowane',
      'koszty_zabezpieczone_suma_skumulowane'
    ]);
  };

  const handleSeriesChange = (event) => {
    const { value, checked } = event.target;
    setSelectedSeries(prevSeries =>
      checked ? [...prevSeries, value] : prevSeries.filter(series => series !== value)
    );
  };
  
  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setIsAdmin(false);
  };
  
  const handleLogin = (user) => {
    if (user) {
      setIsLoggedIn(true);
      setIsAdmin(user.role === 'admin');
      loadData();
    }
  };
  
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }
  
  if (loading) {
    return <div className="loading-message">Ładowanie danych...</div>;
  }

  const dataToDisplayFull = dataType === 'projects' ? projektyDataFull : dzialyDataFull;
  const dataToDisplayShort = dataType === 'projects' ? projektyDataShort : dzialyDataShort;
  const dataToDisplaySummary = dataType === 'projects' ? projektySumy : dzialySumy;
  
  let currentObjectDataFull;
  let currentObjectDataShort;
  let currentSummaryData;
  let currentTitle;

  if (dataType === 'departments' && isMultiSelectEnabled && aggregatedDataFull) {
    currentObjectDataFull = aggregatedDataFull;
    currentObjectDataShort = aggregatedDataShort;
    currentSummaryData = aggregatedSummary;
    currentTitle = 'zagregowane działy: ' + selectedDepartments.join(', ');
  } else {
    currentObjectDataFull = selectedKey ? dataToDisplayFull[selectedKey] : null;
    currentObjectDataShort = selectedKey ? dataToDisplayShort[selectedKey] : null;
    currentSummaryData = selectedKey ? dataToDisplaySummary[selectedKey] : null;
    currentTitle = selectedKey;
  }
  
  const availableSeries = currentObjectDataFull && currentObjectDataFull.length > 0
    ? Object.keys(currentObjectDataFull[0]).filter(key => key !== 'miesiac' && key !== 'LMP' && key !== 'LMD' && key !== 'nazwa_dzialu')
    : [];

  const categorizedSeries = categorizeSeries(availableSeries);

  const renderCategory = (title, keys, colorClass) => {
    if (keys.length === 0) {
      return null;
    }
    return (
      <div className={`category-group ${colorClass}`}>
        <div className="category-header">
          <h4>{title}</h4>
        </div>
        <div className="checkbox-group">
          {keys.map(seriesName => (
            <label key={seriesName} className="checkbox-label">
              <input
                type="checkbox"
                value={seriesName}
                checked={selectedSeries.includes(seriesName)}
                onChange={handleSeriesChange}
              />
              {formatSeriesName(seriesName)}
            </label>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="App">
      <div className="page-wrapper">
        <aside className="sidebar" ref={sidebarRef} style={{ width: sidebarWidth }}>
          <div className="sidebar-header">
            <h2>Panel Wyboru</h2>
            {isAdmin && <button onClick={() => setShowFileManagementModal(true)}>Zarządzaj plikami</button>}
            {isAdmin && <button onClick={() => setShowUserManagementModal(true)}>Zarządzaj użytkownikami</button>}
            <button onClick={handleLogout} style={{ marginTop: '10px' }}>Wyloguj</button>
          </div>

          <div className="controls-group">
            <label htmlFor="data-type-select">Wybierz typ danych:</label>
            <select id="data-type-select" value={dataType} onChange={handleDataTypeChange}>
              <option value="projects">Projekty</option>
              <option value="departments">Działy</option>
            </select>
          </div>

          {dataType === 'projects' && (
            <div className="controls-group">
              <label htmlFor="object-select">Wybierz projekt:</label>
              <select id="object-select" value={selectedKey || ''} onChange={handleKeyChange}>
                {dataToDisplayFull && Object.keys(dataToDisplayFull).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          )}
          
          {dataType === 'departments' && (
            <div className="controls-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={isMultiSelectEnabled}
                  onChange={handleMultiSelectToggle}
                />
                Zaznacz wiele działów
              </label>

              {isMultiSelectEnabled ? (
                <>
                  <label>Wybierz działy:</label>
                  <button onClick={handleSelectAll} className="select-all-button">Zaznacz wszystkie</button>
                  <div className="multi-select-container">
                    {Object.keys(dataToDisplayFull).map(key => (
                      <label key={key} className="multi-select-item">
                        <input
                          type="checkbox"
                          value={key}
                          checked={selectedDepartments.includes(key)}
                          onChange={handleDepartmentSelection}
                        />
                        {key}
                      </label>
                    ))}
                  </div>
                  <button
                    className="aggregate-button"
                    onClick={handleAggregate}
                    disabled={selectedDepartments.length < 2}
                  >
                    Wyświetl zagregowane dane
                  </button>
                </>
              ) : (
                <>
                  <label htmlFor="object-select">Wybierz dział:</label>
                  <select id="object-select" value={selectedKey || ''} onChange={handleKeyChange}>
                    {dataToDisplayFull && Object.keys(dataToDisplayFull).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )}

          <div className="controls-group series-selection">
            {renderCategory('Przychody', categorizedSeries.przychody, 'przychody')}
            {renderCategory('Koszty Zabezpieczone', categorizedSeries.koszty_zabezpieczone, 'koszty-zabezpieczone')}
            {renderCategory('Koszty Rzeczywiste', categorizedSeries.koszty_rzeczywiste, 'koszty-rzeczywiste')}
            {dataType === 'departments' && renderCategory('Różnice', categorizedSeries.roznice, 'roznice')}
          </div>
          <div className="sidebar-resizer" onMouseDown={handleMouseDown} />
        </aside>

        <main className="main-content">
          <h1>Dashboard finansowy</h1>
          
          {currentObjectDataFull && (
            <div className="chart-section">
              <h2>Wykres dla pełnych danych: {currentTitle}</h2>
              <DataChart
                data={currentObjectDataFull}
                seriesKeys={selectedSeries}
                dateKey={dataType === 'projects' ? 'miesiac' : 'LMD'}
              />
            </div>
          )}

          {currentObjectDataShort && (
            <>
              <hr className="divider" />
              <div className="chart-section">
                <h2>Wykres dla danych od bieżącego miesiąca (short): {currentTitle}</h2>
                <DataChart
                  data={currentObjectDataShort}
                  seriesKeys={selectedSeries}
                  dateKey={dataType === 'projects' ? 'miesiac' : 'LMD'}
                />
              </div>
            </>
          )}

          {(!selectedKey && !isMultiSelectEnabled) && (
            <div className="no-data-message">
              Wybierz kategorię, element i co najmniej jedną zmienną, aby wyświetlić wykresy.
            </div>
          )}
          
          {currentSummaryData && (
            <SummaryTable 
              data={currentSummaryData} 
              title={currentTitle} 
            />
          )}
        </main>
      </div>
      {showFileManagementModal && <FileManagementModal onClose={() => setShowFileManagementModal(false)} onUpdate={loadData} />}
      {showUserManagementModal && <UserManagementModal onClose={() => setShowUserManagementModal(false)} />}
    </div>
  );
}

export default App;