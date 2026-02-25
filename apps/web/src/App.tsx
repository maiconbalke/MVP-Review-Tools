import { useState, useEffect } from 'react';
import './App.css';

interface Finding {
  ruleId: string;
  severity: string;
  message: string;
  category?: string;
  recommendation?: string;
}

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [policyProfile, setPolicyProfile] = useState('standard');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState<boolean>(false);
  const [jobPolicy, setJobPolicy] = useState<string | null>(null);

  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [score, setScore] = useState<number | null>(null);
  const [grade, setGrade] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [showAllJobs, setShowAllJobs] = useState(false);

  const loadRecentJobs = () => {
    try {
      const stored = localStorage.getItem('reviewtools_recent_jobs');
      if (stored) {
        setRecentJobs(JSON.parse(stored));
      } else {
        setRecentJobs([]);
      }
    } catch (err) {
      console.error('Failed to parse recent jobs from localStorage:', err);
    }
  };

  const saveRecentJob = (job: any) => {
    try {
      const stored = localStorage.getItem('reviewtools_recent_jobs');
      let jobs: any[] = stored ? JSON.parse(stored) : [];
      jobs = jobs.filter(j => j.jobId !== job.jobId);
      jobs.unshift(job);
      localStorage.setItem('reviewtools_recent_jobs', JSON.stringify(jobs));
      setRecentJobs(jobs);
    } catch (err) {
      console.error('Failed to save recent job:', err);
    }
  };

  const updateRecentJob = (currentJobId: string, updates: any) => {
    try {
      const stored = localStorage.getItem('reviewtools_recent_jobs');
      if (stored) {
        let jobs = JSON.parse(stored);
        const idx = jobs.findIndex((j: any) => j.jobId === currentJobId);
        if (idx !== -1) {
          jobs[idx] = { ...jobs[idx], ...updates };
          localStorage.setItem('reviewtools_recent_jobs', JSON.stringify(jobs));
          setRecentJobs(jobs);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearRecentJobs = () => {
    localStorage.removeItem('reviewtools_recent_jobs');
    setRecentJobs([]);
  };

  useEffect(() => {
    loadRecentJobs();
  }, []);

  const handleAnalyze = async () => {
    if (!repoUrl.trim() && !file) return;

    setLoading(true);
    setError(null);
    setJobId(null);
    setStatus(null);
    setHasResult(false);
    setJobPolicy(null);
    setFindings(null);
    setSummary(null);
    setScore(null);
    setGrade(null);

    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        response = await fetch(`http://127.0.0.1:3001/analyze/upload?policy=${policyProfile}`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`http://127.0.0.1:3001/analyze?policy=${policyProfile}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ repoUrl }),
        });
      }

      if (!response.ok) {
        throw new Error(`Analyze request failed with status: ${response.status}`);
      }

      const data = await response.json();
      setJobId(data.jobId);

      saveRecentJob({
        jobId: data.jobId,
        createdAt: new Date().toISOString(),
        status: 'queued',
        policyProfile: policyProfile
      });
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Erro ao iniciar análise';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || err.name === 'TypeError') {
        msg = 'API offline? Verifique npm -w services/api run dev (Ou problema de CORS com @fastify/cors version mismatch)';
      }
      setError(msg);
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      if (!jobId || status === 'done' || status === 'error') return;

      try {
        const response = await fetch(`http://127.0.0.1:3001/jobs/${jobId}/status`);
        if (!response.ok) {
          throw new Error('Falha ao checar status');
        }

        const data = await response.json();

        setStatus(data.status);
        setHasResult(data.hasResult);
        if (data.policyProfile) setJobPolicy(data.policyProfile);

        updateRecentJob(jobId, { status: data.status, policyProfile: data.policyProfile || jobPolicy });

        if (data.status === 'done' && data.hasResult) {
          await fetchFindings();
        } else if (data.status === 'done' && !data.hasResult) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error(err);
        let msg = err.message || 'Erro ao checar status';
        if (err.name === 'TypeError' || msg.includes('Failed to fetch')) {
          msg = 'API offline? Verifique npm -w services/api run dev (Ou problema de CORS)';
        }
        setError(msg);
        setStatus('error');
        updateRecentJob(jobId, { status: 'error' });
        setLoading(false);
      }
    };

    const fetchFindings = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:3001/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar resultados');
        }

        const data = await response.json();

        const extractedFindings = data.findings || data || [];
        const fArray = Array.isArray(extractedFindings) ? extractedFindings : [];
        setFindings(fArray);

        if (data.policyProfile) {
          setJobPolicy(data.policyProfile);
          if (jobId) updateRecentJob(jobId, { policyProfile: data.policyProfile });
        }

        if (data.summary) {
          setSummary(data.summary);
          if (typeof data.score === 'number') setScore(data.score);
          if (data.grade) setGrade(data.grade);
        } else {
          const fbSum = { info: 0, low: 0, medium: 0, high: 0, total: 0 };
          for (const f of fArray) {
            const sev = f.severity as keyof typeof fbSum;
            if (sev in fbSum) fbSum[sev]++;
            fbSum.total++;
          }
          setSummary(fbSum);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro ao carregar os resultados');
      } finally {
        setLoading(false);
      }
    };

    if (jobId && status !== 'done' && status !== 'error') {
      intervalId = setInterval(checkStatus, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, status]);

  const getGradeExplanation = (gradeValue: string) => {
    switch (gradeValue) {
      case 'A': return "Excelente! O repositório segue a maioria das melhores práticas com pouquíssimas advertências.";
      case 'B': return "Bom. O repositório está no caminho certo, mas existem alguns pontos de melhoria importantes.";
      case 'C': return "Regular. Há várias questões de média ou alta severidade que precisam de atenção em breve.";
      case 'D': return "Abaixo da média. Existem problemas críticos ou muitas violações que comprometem a qualidade e segurança.";
      case 'F': return "Crítico! O repositório apresenta muitas violações graves de arquitetura/segurança. Ação imediata é necessária.";
      default: return "";
    }
  };

  const getTopRecommendations = () => {
    if (!findings || findings.length === 0) return [];

    const severityWeight: Record<string, number> = {
      high: 30,
      medium: 15,
      low: 5,
      info: 0
    };

    const sorted = [...findings].sort((a, b) => {
      const wA = severityWeight[a.severity] ?? 0;
      const wB = severityWeight[b.severity] ?? 0;
      return wB - wA;
    });

    return sorted.slice(0, 3);
  };

  const displayedJobs = showAllJobs ? recentJobs : recentJobs.slice(0, 5);

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Review Tools - MVP Analyzer</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

        {/* Lado Esquerdo - Main View */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.95rem', color: '#444' }}>Analisar via URL do Repositório (GitHub)</label>
                <input
                  type="text"
                  placeholder="https://github.com/user/repo"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    if (e.target.value) setFile(null);
                  }}
                  disabled={loading && status !== 'done'}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', fontSize: '1rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', backgroundColor: (loading && status !== 'done') ? '#f3f4f6' : '#fff' }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                <span style={{ padding: '0 16px', fontWeight: '600', color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.95rem', color: '#444' }}>Fazer Upload de Projeto Local (.zip)</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                      if (selectedFile) setRepoUrl('');
                    }}
                    disabled={loading && status !== 'done'}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      opacity: 0,
                      cursor: (loading && status !== 'done') ? 'not-allowed' : 'pointer',
                      width: '100%',
                      height: '100%',
                      zIndex: 10
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '24px 16px',
                    borderRadius: '8px',
                    border: `2px dashed ${file ? '#3b82f6' : '#d1d5db'}`,
                    backgroundColor: file ? '#eff6ff' : '#f9fafb',
                    color: file ? '#1d4ed8' : '#6b7280',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}>
                    <span role="img" aria-label="upload" style={{ fontSize: '1.8rem' }}>{file ? '📦' : '📤'}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontWeight: file ? '600' : '500', fontSize: '1.05rem', color: file ? '#1e40af' : '#4b5563' }}>
                        {file ? file.name : 'Clique para procurar ou arraste o arquivo .zip aqui'}
                      </span>
                      {file && <span style={{ fontSize: '0.85rem', color: '#3b82f6', marginTop: '4px' }}>Arquivo selecionado pronto para análise</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label htmlFor="policy-select" style={{ fontWeight: '600', color: '#444' }}>Policy Profile:</label>
              <select
                id="policy-select"
                value={policyProfile}
                onChange={(e) => setPolicyProfile(e.target.value)}
                disabled={loading && status !== 'done'}
                style={{ padding: '10px 16px', fontSize: '1rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                <option value="standard">Standard (Default)</option>
                <option value="strict">Strict (High Penalties)</option>
                <option value="security">Security</option>
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={(loading && status !== 'done') || (!repoUrl.trim() && !file)}
              style={{
                padding: '14px 32px',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: (loading && status !== 'done') || (!repoUrl.trim() && !file) ? '#9ca3af' : '#2563eb',
                color: '#fff',
                cursor: (loading && status !== 'done') || (!repoUrl.trim() && !file) ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-start',
                boxShadow: (loading && status !== 'done') || (!repoUrl.trim() && !file) ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)',
                transition: 'all 0.2s',
              }}
              onMouseDown={(e) => { if (!((loading && status !== 'done') || (!repoUrl.trim() && !file))) e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = (loading && status !== 'done') || (!repoUrl.trim() && !file) ? '#9ca3af' : '#2563eb'; }}
              onMouseEnter={(e) => { if (!((loading && status !== 'done') || (!repoUrl.trim() && !file))) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
            >
              {loading && !jobId ? 'Iniciando...' : 'Analisar Projeto'}
            </button>
          </div>

          {error && (
            <div style={{ backgroundColor: '#ffe6e6', color: '#c00', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #ffcccc' }}>
              <strong>Erro:</strong> {error}
            </div>
          )}

          {jobId && (
            <div style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem', border: '1px solid #e9ecef' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>Job ID:</strong> {jobId}
                  <button onClick={() => navigator.clipboard.writeText(jobId)} style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>Copiar Job ID</button>
                </p>
                {hasResult && (
                  <a href={`http://127.0.0.1:3001/jobs/${jobId}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Abrir JSON do resultado</a>
                )}
              </div>
              <p style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>Status:</strong>
                <span style={{
                  backgroundColor: status === 'done' ? '#d4edda' : status === 'error' ? '#f8d7da' : '#fff3cd',
                  color: status === 'done' ? '#155724' : status === 'error' ? '#721c24' : '#856404',
                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold'
                }}>
                  {status || 'queued'}
                </span>

                {jobPolicy && (
                  <span style={{ marginLeft: '10px', fontSize: '0.9rem', backgroundColor: '#e2e3e5', padding: '2px 8px', borderRadius: '12px', border: '1px solid #ccc' }}>
                    Policy Usada: <strong>{jobPolicy}</strong>
                  </span>
                )}
              </p>

              <p style={{ margin: '0 0 10px 0' }}><strong>Has Result:</strong> {hasResult ? 'Sim' : 'Não'}</p>

              {loading && status !== 'done' && status !== 'error' && (
                <p style={{ margin: 0, color: '#666' }}><em>Aguardando processamento (polling a cada 1s)...</em></p>
              )}
            </div>
          )}

          {findings && (
            <div>
              <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                Resultados da Análise
                {score !== null && grade !== null && (
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: grade === 'A' || grade === 'B' ? '#28a745' : grade === 'C' || grade === 'D' ? '#ffc107' : '#dc3545' }}>
                    Score: {score} (Grade {grade})
                  </span>
                )}
              </h2>

              {score !== null && grade !== null && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: `1px solid ${grade === 'A' || grade === 'B' ? '#c3e6cb' : grade === 'C' || grade === 'D' ? '#ffeeba' : '#f5c6cb'}`, marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>O que isso significa?</h4>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {getGradeExplanation(grade)}
                  </p>
                </div>
              )}

              {findings.length > 0 && (
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #17a2b8', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0c5460', borderBottom: '2px solid #e1e4e8', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span role="img" aria-label="rocket">🚀</span> Próximos passos recomendados
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    Foque nestas ações de maior impacto para melhorar rapidamente a qualidade do seu repositório.
                  </p>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {getTopRecommendations().map((rec, i) => {
                      const impact = rec.severity === 'high' ? 30 : rec.severity === 'medium' ? 15 : rec.severity === 'low' ? 5 : 0;
                      return (
                        <div key={i} style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px', borderLeft: `4px solid ${rec.severity === 'high' ? '#c62828' : rec.severity === 'medium' ? '#ef6c00' : rec.severity === 'low' ? '#2e7d32' : '#6c757d'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '1.05rem', color: '#333' }}>Ação {i + 1}: {rec.ruleId}</strong>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555', backgroundColor: '#e2e3e5', padding: '2px 8px', borderRadius: '12px' }}>
                              Impacto estimado: +{impact} pts
                            </span>
                          </div>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#444' }}>{rec.message}</p>
                          {rec.recommendation && (
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#0056b3', display: 'flex', gap: '4px' }}>
                              <strong style={{ minWidth: '40px' }}>Dica:</strong> <span>{rec.recommendation}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {summary && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <strong>Summary:</strong>
                  <span style={{ padding: '4px 8px', backgroundColor: '#e2e3e5', borderRadius: '4px' }}>Total: {summary.total}</span>
                  <span style={{ padding: '4px 8px', backgroundColor: '#d1ecf1', borderRadius: '4px', color: '#0c5460' }}>Info: {summary.info}</span>
                  <span style={{ padding: '4px 8px', backgroundColor: '#d4edda', borderRadius: '4px', color: '#155724' }}>Low: {summary.low}</span>
                  <span style={{ padding: '4px 8px', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>Medium: {summary.medium}</span>
                  <span style={{ padding: '4px 8px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>High: {summary.high}</span>
                </div>
              )}

              {findings.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhum problema encontrado. O repositório parece estar em conformidade.</p>
              ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {findings.map((finding, index) => (
                    <li key={index} style={{ backgroundColor: '#fff', marginBottom: '1rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: '#333' }}>{finding.ruleId}</strong>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          backgroundColor: finding.severity === 'high' ? '#ffebee' : finding.severity === 'medium' ? '#fff3e0' : finding.severity === 'low' ? '#e8f5e9' : '#f5f5f5',
                          color: finding.severity === 'high' ? '#c62828' : finding.severity === 'medium' ? '#ef6c00' : finding.severity === 'low' ? '#2e7d32' : '#333'
                        }}>
                          {finding.severity.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: '#555', lineHeight: '1.5' }}>{finding.message}</p>
                      {finding.category && (
                        <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#0056b3' }}>
                          <strong>Category:</strong> {finding.category}
                        </p>
                      )}
                      {finding.recommendation && (
                        <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#155724' }}>
                          <strong>Recommendation:</strong> {finding.recommendation}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Lado Direito - Jobs Recentes */}
        <div style={{ backgroundColor: '#f4f6f8', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e1e4e8', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0 }}>Jobs Recentes</h3>
            {recentJobs.length > 0 && (
              <button
                onClick={clearRecentJobs}
                style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid #dc3545', backgroundColor: '#fff', color: '#dc3545', cursor: 'pointer' }}
              >
                Limpar histórico
              </button>
            )}
          </div>

          {recentJobs.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#666' }}>Nenhum job recente foi encontrado.</p>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayedJobs.map(j => (
                  <li key={j.jobId} style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cce5ff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                      <strong>{j.jobId.slice(0, 8)}</strong>
                      <span style={{ float: 'right', fontSize: '0.8rem', color: '#888' }}>
                        {new Date(j.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '8px', color: '#555' }}>
                      Status: <span style={{ fontWeight: 'bold' }}>{j.status}</span> <br />
                      Policy: <strong>{j.policyProfile}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setJobId(j.jobId);
                        setStatus(j.status);
                        setFindings(null);
                        setError(null);
                      }}
                      style={{ width: '100%', padding: '6px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #007bff', backgroundColor: 'transparent', color: '#007bff', fontSize: '0.85rem' }}
                    >
                      Carregar este job
                    </button>
                  </li>
                ))}
              </ul>

              {recentJobs.length > 5 && (
                <button
                  onClick={() => setShowAllJobs(!showAllJobs)}
                  style={{ width: '100%', marginTop: '1rem', padding: '8px', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: '#e2e3e5', color: '#333', fontSize: '0.85rem', fontWeight: 'bold' }}
                >
                  {showAllJobs ? 'Ver menos' : `Ver mais (${recentJobs.length - 5})`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
