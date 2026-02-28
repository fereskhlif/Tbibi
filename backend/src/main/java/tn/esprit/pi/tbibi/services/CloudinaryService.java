package tn.esprit.pi.tbibi.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class CloudinaryService {

    Cloudinary cloudinary;

    // upload one image
    public String uploadImage(MultipartFile file) {
        try {
            Map result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "tbibi/medicines")
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Image upload failed");
        }
    }

    // upload multiple images
    public List<String> uploadImages(List<MultipartFile> files) {
        return files.stream()
                .map(this::uploadImage)
                .toList();
    }

    // delete image
    public void deleteImage(String imageUrl) {
        try {
            String publicId = imageUrl
                    .substring(imageUrl.lastIndexOf("/") + 1)
                    .replace(".jpg", "")
                    .replace(".png", "");
            cloudinary.uploader().destroy(
                    "tbibi/medicines/" + publicId,
                    ObjectUtils.emptyMap()
            );
        } catch (Exception e) {
            throw new RuntimeException("Image delete failed");
        }
    }
}
