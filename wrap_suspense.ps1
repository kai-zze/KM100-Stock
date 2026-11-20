$path = 'src/App.tsx'
$content = [System.IO.File]::ReadAllText($path)

# Wrap ItemModal - opening
$content = $content.Replace('      {isItemModalOpen && (`n        <ItemModal', '      {isItemModalOpen && (`n        <Suspense fallback={null}>`n          <ItemModal')
# Wrap ItemModal - closing
$content = $content.Replace('        />`n      )}', '        />`n        </Suspense>`n      )}')

# Wrap ColumnsSchemaModal - opening
$content = $content.Replace('      {isColumnsModalOpen && (`n        <ColumnsSchemaModal', '      {isColumnsModalOpen && (`n        <Suspense fallback={null}>`n          <ColumnsSchemaModal')
# Wrap ColumnsSchemaModal - closing
$content = $content.Replace('        />`n      )}', '        />`n        </Suspense>`n      )}')

# Wrap RoomModal - opening
$content = $content.Replace('      {isRoomModalOpen && (`n        <RoomModal', '      {isRoomModalOpen && (`n        <Suspense fallback={null}>`n          <RoomModal')
# Wrap RoomModal - closing
$content = $content.Replace('        />`n      )}', '        />`n        </Suspense>`n      )}')

# Wrap AssetTagModal - opening
$content = $content.Replace('      {assetTagItem && (`n        <AssetTagModal', '      {assetTagItem && (`n        <Suspense fallback={null}>`n          <AssetTagModal')
# Wrap AssetTagModal - closing
$content = $content.Replace('        />`n      )}', '        />`n        </Suspense>`n      )}')

# Wrap ImportPreviewModal - opening
$content = $content.Replace('      {importAnalysis && (`n        <ImportPreviewModal', '      {importAnalysis && (`n        <Suspense fallback={null}>`n          <ImportPreviewModal')
# Wrap ImportPreviewModal - closing
$content = $content.Replace('        />`n      )}', '        />`n        </Suspense>`n      )}')

# Wrap PrintReport - opening
$content = $content.Replace('`n      <PrintReport`n', '`n      <Suspense fallback={null}>`n        <PrintReport`n')
# Wrap PrintReport - closing
$content = $content.Replace('        />`n', '        />`n      </Suspense>`n')

[System.IO.File]::WriteAllText($path, $content)
Write-Host "Done wrapping with Suspense"