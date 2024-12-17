import torch
from torchvision import transforms
from PIL import Image

# Load your pre-trained PyTorch model
def load_model(model_path='model.pth'):
    model = torch.load(model_path, map_location=torch.device('cpu'))
    model.eval()  # Set the model to evaluation mode
    return model

# Preprocess the image for the model
def preprocess_image(image_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    transform = transforms.Compose([
        transforms.Resize((224, 224)),  # Resize to the model's input size
        transforms.ToTensor(),          # Convert to a tensor
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406], # Normalization values (ImageNet standards)
            std=[0.229, 0.224, 0.225]
        ),
    ])
    image = Image.open(image_path)
    return transform(image).unsqueeze(0)

# Perform inference
def predict(model, image_tensor):
    with torch.no_grad():  # Disable gradient computation for inference
        output = model(image_tensor)
        pred = torch.sigmoid(output).item() 
        print(pred)
        prediction = 1 if pred > 0.5 else 0  # Set threshold for binary classification
    return prediction
