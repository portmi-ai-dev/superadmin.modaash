// app/(dashboard)/analysis/page.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiAlertCircle,
    FiBarChart2,
    FiDatabase,
    FiDownload,
    FiFileText,
    FiImage,
    FiLock,
    FiShield,
    FiUsers
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { superAdminClient } from '../../lib/api';

export default function AnalysisPage() {
    const [loading, setLoading] = useState(false);
    const [exportType, setExportType] = useState<'json' | 'csv'>('json');
    const [documentId, setDocumentId] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Fetch worker statistics
    const fetchWorkerStats = async () => {
        setLoadingStats(true);
        try {
            const response = await superAdminClient.get(`/workers?limit=1`);
            const total = response.data.pagination?.total || 0;
            // Count documents across workers (estimate)
            const workersResponse = await superAdminClient.get(`/workers?limit=1000`);
            const workers = workersResponse.data.data || [];
            const totalDocuments = workers.reduce((sum: number, w: any) => sum + (w.documents?.length || 0), 0);

            setStats({
                total,
                totalDocuments,
                estimatedDataSize: Math.round(total * 2.5 / 1024) // Rough estimate in MB
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    // Export worker data
    const handleExport = async () => {
        const reason = prompt(
            '📋 Reason for Worker Data Export\n\n' +
            'Please provide a valid reason for exporting sensitive worker data.\n' +
            'Examples:\n' +
            '- R visualization for worker deployment trends\n' +
            '- Machine learning model for worker placement prediction\n' +
            '- Statistical analysis for workforce planning\n' +
            '- Research on worker mobility patterns'
        );

        if (!reason) return;
        if (reason.trim().length < 10) {
            toast.error('Please provide a more detailed reason (minimum 10 characters)');
            return;
        }

        setLoading(true);
        try {
            const response = await superAdminClient.get(
                `/workers?unmask=true&reason=${encodeURIComponent(reason)}&limit=10000`,
                { responseType: exportType === 'csv' ? 'blob' : 'json' }
            );

            if (exportType === 'csv') {
                const workers = response.data.data;
                const csvData = convertToCSV(workers);
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `workers-data-${new Date().toISOString().slice(0, 19)}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast.success(`CSV export completed: ${workers.length} workers exported and logged`);
            } else {
                const workers = response.data.data;
                const exportData = {
                    exportedAt: new Date().toISOString(),
                    reason: reason,
                    totalWorkers: workers.length,
                    workers: workers
                };
                const dataStr = JSON.stringify(exportData, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `workers-data-${new Date().toISOString().slice(0, 19)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success(`JSON export completed: ${workers.length} workers exported and logged`);
            }
        } catch (error: any) {
            console.error('Export failed:', error);
            toast.error(error?.response?.data?.message || 'Export failed. Please check your permissions.');
        } finally {
            setLoading(false);
        }
    };

    // Download individual document
    const handleDownloadDocument = async () => {
        if (!documentId.trim()) {
            toast.error('Please enter a document public ID');
            return;
        }

        const reason = prompt(
            '📋 Reason for Document Access\n\n' +
            'Please provide a valid reason for accessing this document:\n' +
            'Examples:\n' +
            '- Verification for audit\n' +
            '- Legal compliance check\n' +
            '- Document review for worker case\n' +
            '- Quality assurance'
        );

        if (!reason) return;
        if (reason.trim().length < 10) {
            toast.error('Please provide a more detailed reason (minimum 10 characters)');
            return;
        }

        setDownloading(true);
        try {
            const response = await superAdminClient.get(
                `/files/proxy?public_id=${encodeURIComponent(documentId)}&reason=${encodeURIComponent(reason)}`,
                { responseType: 'blob' }
            );

            // Determine file extension from response or default to .pdf
            const contentDisposition = response.headers?.['content-disposition'];
            let filename = `document-${Date.now()}`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = match[1].replace(/['"]/g, '');
                }
            }

            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Document downloaded (access logged)');
        } catch (error: any) {
            console.error('Download failed:', error);
            toast.error(error?.response?.data?.message || 'Failed to download document. Check public_id and permissions.');
        } finally {
            setDownloading(false);
        }
    };

    // Helper function to convert workers to CSV
    const convertToCSV = (workers: any[]) => {
        if (!workers || workers.length === 0) return '';

        const columns = [
            '_id', 'name', 'passportNumber', 'citizenshipNumber', 'contact', 'address', 'email', 'country',
            'status', 'currentStage', 'dob', 'companyId', 'companyName', 'employerId', 'employerName',
            'employerCountry', 'jobDemandId', 'jobTitle', 'subAgentId', 'subAgentName', 'createdAt', 'deleted'
        ];

        const header = columns.join(',');

        const rows = workers.map(worker => {
            return columns.map(col => {
                let value = '';
                switch (col) {
                    case 'companyName':
                        value = worker.company?.name || '';
                        break;
                    case 'employerName':
                        value = worker.employer?.employerName || '';
                        break;
                    case 'employerCountry':
                        value = worker.employer?.country || '';
                        break;
                    case 'jobTitle':
                        value = worker.jobDemand?.jobTitle || '';
                        break;
                    case 'subAgentName':
                        value = worker.subAgent?.name || '';
                        break;
                    default:
                        value = worker[col] !== undefined && worker[col] !== null ? String(worker[col]) : '';
                }
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            }).join(',');
        });

        return [header, ...rows].join('\n');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Worker Data Analysis</h1>
                <p className="text-gray-600 mt-1">
                    Export full worker data and access documents for R, Python, or AI analysis. All actions are audited.
                </p>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <FiShield className="text-blue-600 text-lg mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-800">⚠️ Sensitive Worker Data</p>
                        <p className="text-xs text-blue-700 mt-1">
                            This section contains sensitive worker information including passport numbers, citizenship numbers, and documents.
                            All exports and document accesses are logged with your reason and IP address for audit purposes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Card */}
            <Card>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FiUsers className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Workers in Database</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.total || '—'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-full">
                                <FiFileText className="text-green-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Documents</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.totalDocuments || '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchWorkerStats}
                        isLoading={loadingStats}
                    >
                        Refresh Stats
                    </Button>
                </div>
                {stats?.estimatedDataSize && (
                    <p className="text-xs text-gray-400 mt-3">
                        Estimated data export size: ~{stats.estimatedDataSize} MB (documents not included)
                    </p>
                )}
            </Card>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* JSON Export Card */}
                <div
                    className={`cursor-pointer transition-all ${exportType === 'json' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setExportType('json')}
                >
                    <Card className="h-full">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FiDatabase className="text-blue-500 text-xl" />
                                    <span className="text-sm font-medium text-gray-700">JSON Format</span>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 ${exportType === 'json' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                            </div>
                            <p className="text-sm text-gray-600">
                                Best for R, Python, and programmatic analysis. Preserves full data structure with nested objects.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-mono text-gray-600">
                                    📊 Includes: passport numbers, citizenship numbers, stage timeline, document metadata
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* CSV Export Card */}
                <div
                    className={`cursor-pointer transition-all ${exportType === 'csv' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setExportType('csv')}
                >
                    <Card className="h-full">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FiBarChart2 className="text-green-500 text-xl" />
                                    <span className="text-sm font-medium text-gray-700">CSV Format</span>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 ${exportType === 'csv' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                            </div>
                            <p className="text-sm text-gray-600">
                                Best for R visualization, Excel, and statistical analysis. Flattened data structure.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-mono text-gray-600">
                                    📈 Ready for: ggplot2, dplyr, Tableau, Power BI, Excel
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Export Button */}
            <Card>
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-yellow-50 rounded-full">
                        <FiLock className="text-yellow-600 text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Export Worker Data</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Click the button below to export all worker data in {exportType.toUpperCase()} format.
                            You will be asked to provide a reason for the export.
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleExport}
                        isLoading={loading}
                    >
                        <FiDownload className="mr-2" />
                        {loading ? 'Exporting...' : `Export ${exportType.toUpperCase()}`}
                    </Button>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <FiAlertCircle className="text-xs" />
                        This action will be logged in the audit system
                    </p>
                </div>
            </Card>

            {/* Document Download Section */}
            <Card title="📄 Download Worker Documents">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        To download a specific document, enter its public_id from the exported data.
                        Each document access is logged for audit purposes.
                    </p>

                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                            💡 How to find public_id:
                            <br />
                            1. Export worker data (JSON format above)
                            <br />
                            2. Look for the "documents" array in each worker
                            <br />
                            3. Copy the "publicId" value (e.g., "workers/abc123")
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Document public_id (e.g., workers/abc123)"
                            value={documentId}
                            onChange={(e) => setDocumentId(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                        <Button
                            variant="primary"
                            onClick={handleDownloadDocument}
                            isLoading={downloading}
                        >
                            <FiImage className="mr-2" />
                            {downloading ? 'Downloading...' : 'Download Document'}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <FiLock className="text-xs" />
                        Document access is logged with your reason and IP address
                    </p>
                </div>
            </Card>

            {/* R Integration Guide */}
            <Card title="📊 R Integration Guide">
                <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                        After exporting the worker data, use these R scripts for analysis:
                    </p>

                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                            {`# Load JSON data
library(jsonlite)
library(ggplot2)
library(dplyr)
library(lubridate)

# Read the exported worker data
data <- fromJSON("workers-data.json")
workers <- data$workers

# Basic statistics
summary(workers)

# Status distribution
ggplot(workers, aes(x = status, fill = status)) +
    geom_bar() +
    ggtitle("Worker Status Distribution") +
    theme_minimal()

# Deployment trends by month
workers$createdAt <- as.Date(workers$createdAt)
workers$month <- floor_date(workers$createdAt, "month")

monthly_trend <- workers %>%
    group_by(month) %>%
    summarise(count = n())

ggplot(monthly_trend, aes(x = month, y = count)) +
    geom_line(group = 1, color = "blue", size = 1) +
    geom_point(color = "red", size = 2) +
    ggtitle("Worker Registration Trend") +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Status by country
workers %>%
    group_by(country, status) %>%
    summarise(count = n()) %>%
    ggplot(aes(x = country, y = count, fill = status)) +
    geom_bar(stat = "identity", position = "dodge") +
    ggtitle("Worker Status by Country")

# Download document using public_id
download_document <- function(public_id, reason, token) {
  url <- paste0("http://localhost:5000/api/super-admin/files/proxy?public_id=", 
                URLencode(public_id), "&reason=", URLencode(reason))
  GET(url, add_headers(Authorization = paste("Bearer", token)), write_disk("document.pdf"))
}`}
                        </pre>
                    </div>
                </div>
            </Card>

            {/* Python Integration Guide */}
            <Card title="🐍 Python Integration Guide">
                <div className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                            {`import pandas as pd
import json
import requests
import matplotlib.pyplot as plt
import seaborn as sns

# Load JSON data
with open('workers-data.json', 'r') as f:
    data = json.load(f)

# Convert to DataFrame
workers = pd.DataFrame(data['workers'])

# Basic statistics
print(workers.describe())
print(workers['status'].value_counts())

# Status distribution
workers['status'].value_counts().plot(kind='bar')
plt.title('Worker Status Distribution')
plt.show()

# Deployment trends
workers['createdAt'] = pd.to_datetime(workers['createdAt'])
workers['month'] = workers['createdAt'].dt.to_period('M')
monthly_trend = workers.groupby('month').size()

monthly_trend.plot(kind='line', marker='o', figsize=(10, 6))
plt.title('Worker Registration Trend')
plt.xlabel('Month')
plt.ylabel('Number of Workers')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)
plt.show()

# Download document using public_id
def download_document(public_id, reason, token, output_path):
    headers = {'Authorization': f'Bearer {token}'}
    params = {'public_id': public_id, 'reason': reason}
    response = requests.get(
        'http://localhost:5000/api/super-admin/files/proxy',
        headers=headers,
        params=params
    )
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        return True
    return False`}
                        </pre>
                    </div>
                </div>
            </Card>

            {/* Worker Fields Reference */}
            <Card title="📋 Worker Data Fields">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                        <p className="font-medium text-gray-700">Personal Info</p>
                        <ul className="mt-1 space-y-1 text-gray-500 text-xs">
                            <li>• name</li>
                            <li>• passportNumber</li>
                            <li>• citizenshipNumber</li>
                            <li>• contact</li>
                            <li>• address</li>
                            <li>• email</li>
                            <li>• dob</li>
                            <li>• country</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700">Employment</p>
                        <ul className="mt-1 space-y-1 text-gray-500 text-xs">
                            <li>• status</li>
                            <li>• currentStage</li>
                            <li>• employerName</li>
                            <li>• jobTitle</li>
                            <li>• companyName</li>
                            <li>• subAgentName</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700">Documents</p>
                        <ul className="mt-1 space-y-1 text-gray-500 text-xs">
                            <li>• name</li>
                            <li>• category</li>
                            <li>• fileName</li>
                            <li>• fileSize</li>
                            <li>• publicId</li>
                            <li>• uploadedAt</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700">Timeline</p>
                        <ul className="mt-1 space-y-1 text-gray-500 text-xs">
                            <li>• createdAt</li>
                            <li>• stageTimeline</li>
                            <li>• deleted</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
}