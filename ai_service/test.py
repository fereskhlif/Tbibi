import torch

# Test BOTH files directly
for path in ['fracture_model_v2.pt', 'weights/fracture_model_v2.pt']:
    model = torch.jit.load(path, map_location='cpu')
    model.eval()
    rand = torch.randn(1, 3, 224, 224)
    with torch.no_grad():
        out = model(rand)
    print(f"{path}: {out}")