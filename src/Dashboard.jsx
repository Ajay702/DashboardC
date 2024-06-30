import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut, Bubble } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';

const MAX_WIDTH = 5000;
const CHART_HEIGHT = 400;

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    endYear: '',
    topic: '',
    region: '',
    country: '',
    pestle: '',
    source: '',
    sector: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    endYearOptions: [],
    topicOptions: [],
    regionOptions: [],
    countryOptions: [],
    pestleOptions: [],
    sourceOptions: [],
    sectorOptions: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://dashboard-one-delta-61.vercel.app/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
        setFilteredData(result);
        setLoading(false);

        setFilterOptions({
          endYearOptions: [...new Set(result.map(item => item.end_year))].sort(),
          topicOptions: [...new Set(result.map(item => item.topic))].sort(),
          regionOptions: [...new Set(result.map(item => item.region))].sort(),
          countryOptions: [...new Set(result.map(item => item.country))].sort(),
          pestleOptions: [...new Set(result.map(item => item.pestle))].sort(),
          sourceOptions: [...new Set(result.map(item => item.source))].sort(),
          sectorOptions: [...new Set(result.map(item => item.sector))].sort(),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  useEffect(() => {
    const applyFilters = () => {
      let filtered = data;

      if (filters.endYear) {
        filtered = filtered.filter(item => item.end_year.toString() === filters.endYear);
      }
      if (filters.topic) {
        filtered = filtered.filter(item => item.topic.toLowerCase().includes(filters.topic.toLowerCase()));
      }
      if (filters.region) {
        filtered = filtered.filter(item => item.region.toLowerCase().includes(filters.region.toLowerCase()));
      }
      if (filters.country) {
        filtered = filtered.filter(item => item.country.toLowerCase().includes(filters.country.toLowerCase()));
      }
      if (filters.pestle) {
        filtered = filtered.filter(item => item.pestle.toLowerCase().includes(filters.pestle.toLowerCase()));
      }
      if (filters.source) {
        filtered = filtered.filter(item => item.source.toLowerCase().includes(filters.source.toLowerCase()));
      }
      if (filters.sector) {
        filtered = filtered.filter(item => item.sector.toLowerCase().includes(filters.sector.toLowerCase()));
      }

      setFilteredData(filtered);
    };

    applyFilters();
  }, [filters, data]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const getLineChartData = () => ({
    labels: filteredData.map(item => item.end_year),
    datasets: [
      {
        label: 'Intensity',
        data: filteredData.map(item => item.intensity),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
    ],
  });

  const getBarChartData = () => ({
    labels: filteredData.map(item => item.end_year),
    datasets: [
      {
        label: 'Relevance',
        data: filteredData.map(item => item.relevance),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  });

  const getDoughnutChartData = () => {
    const regions = [...new Set(filteredData.map(item => item.region))];
    const regionCounts = regions.map(region => filteredData.filter(item => item.region === region).length);
    
    return {
      labels: regions,
      datasets: [
        {
          data: regionCounts,
          backgroundColor: regions.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`),
          borderColor: regions.map(() => 'rgba(0, 0, 0, 0.1)'),
          borderWidth: 1,
        },
      ],
    };
  };

  const getTopicChartData = () => {
    const topics = [...new Set(filteredData.map(item => item.topic))];
    const topicCounts = topics.map(topic => filteredData.filter(item => item.topic === topic).length);
    
    return {
      labels: topics,
      datasets: [
        {
          label: 'Topics',
          data: topicCounts,
          backgroundColor: topics.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`),
          borderColor: topics.map(() => 'rgba(0, 0, 0, 0.1)'),
          borderWidth: 1,
        },
      ],
    };
  };

  const getBubbleChartData = () => {
    const sources = [...new Set(filteredData.map(item => item.source))];
    const sourceCounts = sources.map(source => filteredData.filter(item => item.source === source).length);

    return {
      datasets: sources.map((source, index) => ({
        label: source,
        data: [{
          x: index + 1, 
          y: sourceCounts[index], 
          r: sourceCounts[index] * 2 
        }],
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
      }))
    };
  };

  const getCountryLikelihoodLineChartData = () => {
    const countries = [...new Set(filteredData.map(item => item.country))];
    const likelihoods = countries.map(country => {
      const countryData = filteredData.filter(item => item.country === country);
      const totalLikelihood = countryData.reduce((sum, item) => sum + item.likelihood, 0);
      return totalLikelihood / countryData.length; 
    });

    return {
      labels: countries,
      datasets: [
        {
          label: 'Likelihood',
          data: likelihoods,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
        },
      ],
    };
  };

  const chartWidth = Math.min(filteredData.length * 100, MAX_WIDTH);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Data from API</h1>
      <div className="form-grid">
        {Object.entries(filterOptions).map(([key, options]) => (
          <label key={key}>
            {key.replace('Options', '')}:
            <select name={key.replace('Options', '')} value={filters[key.replace('Options', '')]} onChange={handleFilterChange}>
              <option value="">Select...</option>
              {options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <div style={{ width: 'calc(50% - 20px)', overflowX: 'scroll', marginBottom: '40px' }}>
          <h2>Intensity Line Chart</h2>
          <div style={{ height: `${CHART_HEIGHT}px`, width: `${chartWidth}px`, overflowX: 'auto', overflowY: 'hidden' }}>
            <Line data={getLineChartData()} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { x: { beginAtZero: true } } }} />
          </div>
        </div>
        <div style={{ width: 'calc(50% - 20px)', overflowX: 'scroll', marginBottom: '40px' }}>
          <h2>Relevance Bar Chart</h2>
          <div style={{ height: `${CHART_HEIGHT}px`, width: `${chartWidth}px`, overflowX: 'auto', overflowY: 'hidden' }}>
            <Bar data={getBarChartData()} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { x: { beginAtZero: true } } }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <div style={{ width: 'calc(50% - 20px)', marginBottom: '40px' }}>
          <h2>Regions Doughnut Chart</h2>
          <div style={{ height: `${CHART_HEIGHT}px` }}>
            <Doughnut data={getDoughnutChartData()} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
          </div>
        </div>
        <div style={{ width: 'calc(50% - 20px)', marginBottom: '40px' }}>
          <h2>Topics Frequency Bar Chart</h2>
          <div style={{ height: `${CHART_HEIGHT}px` }}>
            <Bar data={getTopicChartData()} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { x: { beginAtZero: true } } }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <div style={{ width: 'calc(50% - 20px)', overflowX: 'scroll', marginBottom: '40px' }}>
          <h2>Sources Bubble Chart</h2>
          <div style={{ height: `${CHART_HEIGHT}px`, width: `${chartWidth}px`, overflowX: 'auto', overflowY: 'hidden' }}>
            <Bubble data={getBubbleChartData()} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { x: { beginAtZero: true }, y: { beginAtZero: true } } }} />
          </div>
        </div>
        <div style={{ width: 'calc(50% - 20px)', overflowX: 'scroll', marginBottom: '40px' }}>
          <h2>Country vs. Likelihood Line Chart</h2>
          <div style={{ height: `${CHART_HEIGHT}px`, width: `${chartWidth}px`, overflowX: 'auto', overflowY: 'hidden' }}>
            <Line
              data={getCountryLikelihoodLineChartData()}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 2,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
