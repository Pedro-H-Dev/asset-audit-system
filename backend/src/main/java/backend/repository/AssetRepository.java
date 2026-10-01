package backend.repository;

import backend.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    Optional<Asset> findByTagNumber(String tagNumber);
    
    boolean existsByTagNumber(String tagNumber);
}