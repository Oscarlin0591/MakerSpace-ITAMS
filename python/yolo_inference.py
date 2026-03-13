import sys
import os

def main():
    # Get image path from Node
    if len(sys.argv) < 2:
            print("Error: No image path passed to python script.")
            sys.exit(1)
    image_path = sys.argv[1]

    # Check if file exists
    if not os.path.exists(image_path):
            print(f"Error: Python cant find image at {image_path}")
            sys.exit(1)
    
    # TODO: Implement YOLO
    print (f"Success: Python processing {os.path.basename(image_path)}")

if __name__ == "__main__":
       main()