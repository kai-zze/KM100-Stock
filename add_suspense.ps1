$path = 'src/App.tsx'
$content = Get-Content $path -Raw

# Wrap ItemModal
$content = $content -replace '{isItemModalOpen && \(`n        <ItemModal', '{isItemModalOpen && (`n        <Suspense fallback={null}>`n          <ItemModal'
$content = $content -replace '        </ItemModal>`n      )}', '        </ItemModal>`n        </Suspense>`n      )}'

# Wrap ColumnsSchemaModal
$content = $content -replace '{isColumnsModalOpen && \(`n        <ColumnsSchemaModal', '{isColumnsModalOpen && (`n        <Suspense fallback={null}>`n          <ColumnsSchemaModal'
$content = $content -replace '        </ColumnsSchemaModal>`n      )}', '        </ColumnsSchemaModal>`n        </Suspense>`n      )}'

# Wrap RoomModal
$content = $content -replace '{isRoomModalOpen && \(`n        <RoomModal', '{isRoomModalOpen && (`n        <Suspense fallback={null}>`n          <RoomModal'
$content = $content -replace '        </RoomModal>`n      )}', '        </RoomModal>`n        </Suspense>`n      )}'

# Wrap AssetTagModal
$content = $content -replace '{assetTagItem && \(`n        <AssetTagModal', '{assetTagItem && (`n        <Suspense fallback={null}>`n          <AssetTagModal'
$content = $content -replace '        </AssetTagModal>`n      )}', '        </AssetTagModal>`n        </Suspense>`n      )}'

# Wrap ImportPreviewModal
$content = $content -replace '{importAnalysis && \(`n        <ImportPreviewModal', '{importAnalysis && (`n        <Suspense fallback={null}>`n          <ImportPreviewModal'
$content = $content -replace '        </ImportPreviewModal>`n      )}', '        </ImportPreviewModal>`n        </Suspense>`n      )}'

# Wrap PrintReport (always rendered, no condition)
$content = $content -replace '<PrintReport`n', '<Suspense fallback={null}>`n  <PrintReport`n'
$content = $content -replace '        </PrintReport>`n', '        </PrintReport>`n        </Suspense>`n'

Set-Content $path $content
Write-Host "Done adding Suspense boundaries"