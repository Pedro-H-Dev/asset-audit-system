package backend.service;

import backend.model.Asset;
import backend.model.AuditLog;
import backend.repository.AssetRepository;
import backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<Asset> findAll() {
        return assetRepository.findAll();
    }

    public Optional<Asset> findById(Long id) {
        return assetRepository.findById(id);
    }

    public Optional<Asset> findByTagNumber(String tagNumber) {
        return assetRepository.findByTagNumber(tagNumber);
    }

    public Asset save(Asset asset) {
        boolean isNew = (asset.getId() == null);
        
        if (isNew && assetRepository.existsByTagNumber(asset.getTagNumber())) {
            throw new IllegalArgumentException("Asset tag number already exists: " + asset.getTagNumber());
        }

        Asset savedAsset = assetRepository.save(asset);

        String action = isNew ? "CREATE" : "UPDATE";
        String details = String.format("Asset %s (%s) - Status: %s, Location: %s", 
                savedAsset.getName(), savedAsset.getTagNumber(), savedAsset.getStatus(), savedAsset.getLocation());
        
        auditLogRepository.save(new AuditLog(savedAsset.getId(), action, details));

        return savedAsset;
    }

    public void deleteById(Long id) {
        Optional<Asset> assetOpt = assetRepository.findById(id);
        if (assetOpt.isPresent()) {
            Asset asset = assetOpt.get();
            auditLogRepository.save(new AuditLog(id, "DELETE", "Asset " + asset.getName() + " deleted"));
            assetRepository.deleteById(id);
        }
    }

    public List<AuditLog> getAuditLogsForAsset(Long assetId) {
        return auditLogRepository.findByAssetIdOrderByTimestampDesc(assetId);
    }
}