package backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tagNumber; // Ex: AST-001

    @Column(nullable = false)
    private String name;

    private String category;
    
    private String location;

    @Enumerated(EnumType.STRING)
    private AssetStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = AssetStatus.AVAILABLE;
        }
    }

    public enum AssetStatus {
        AVAILABLE,
        IN_USE,
        MAINTENANCE,
        DISPOSED
    }
}