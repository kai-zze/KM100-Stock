$path = 'src/App.tsx'
$content = Get-Content $path -Raw

$old = @'
import { ItemModal } from './components/ItemModal';
import { ColumnsSchemaModal } from './components/ColumnsSchemaModal';
import { RoomModal } from './components/RoomModal';
import { AssetTagModal } from './components/AssetTagModal';
import { ImportPreviewModal } from './components/ImportPreviewModal';
import { PrintReport } from './components/PrintReport';
'@

$new = @'
const ItemModal = React.lazy(() => import('./components/ItemModal'));
const ColumnsSchemaModal = React.lazy(() => import('./components/ColumnsSchemaModal'));
const RoomModal = React.lazy(() => import('./components/RoomModal'));
const AssetTagModal = React.lazy(() => import('./components/AssetTagModal'));
const ImportPreviewModal = React.lazy(() => import('./components/ImportPreviewModal'));
const PrintReport = React.lazy(() => import('./components/PrintReport'));
'@

$content = $content -replace [regex]::Escape($old), $new
Set-Content $path $content
Write-Host "Done"