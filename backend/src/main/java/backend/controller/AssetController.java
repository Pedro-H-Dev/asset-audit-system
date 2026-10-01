package backend.controller;

import backend.model.Asset;
import backend.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable Long id) {
        return assetService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tag/{tagNumber}")
    public ResponseEntity<Asset> getAssetByTagNumber(@PathVariable String tagNumber) {
        return assetService.findByTagNumber(tagNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createAsset(@RequestBody Asset asset) {
        try {
            Asset savedAsset = assetService.save(asset);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedAsset);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAsset(@PathVariable Long id, @RequestBody Asset assetDetails) {
        return assetService.findById(id).map(asset -> {
            asset.setName(assetDetails.getName());
            asset.setCategory(assetDetails.getCategory());
            asset.setLocation(assetDetails.getLocation());
            if (assetDetails.getStatus() != null) {
                asset.setStatus(assetDetails.getStatus());
            }
            Asset updatedAsset = assetService.save(asset);
            return ResponseEntity.ok(updatedAsset);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        if (assetService.findById(id).isPresent()) {
            assetService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    @GetMapping("/{id}/audit-logs")
    public ResponseEntity<List<backend.model.AuditLog>> getAuditLogs(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAuditLogsForAsset(id));
    }
}