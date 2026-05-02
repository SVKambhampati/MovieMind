"""
Optional: download The Movies Dataset from Kaggle.
Requires: pip install kaggle
Then: place kaggle.json at ~/.kaggle/kaggle.json

Run: python setup_data.py
"""
import os
import sys
import zipfile

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
REQUIRED = ['movies_metadata.csv', 'credits.csv', 'keywords.csv', 'ratings.csv']


def check_existing():
    found = [f for f in REQUIRED if os.path.exists(os.path.join(DATA_DIR, f))]
    missing = [f for f in REQUIRED if f not in found]
    print(f"Found: {found}")
    print(f"Missing: {missing}")
    return missing


def download_kaggle():
    try:
        import kaggle  # noqa: F401
    except ImportError:
        print("Install kaggle: pip install kaggle")
        print("Then add your API key to ~/.kaggle/kaggle.json")
        sys.exit(1)

    os.makedirs(DATA_DIR, exist_ok=True)
    print("Downloading The Movies Dataset from Kaggle...")
    os.system(
        f"kaggle datasets download -d rounakbanik/the-movies-dataset "
        f"--path {DATA_DIR} --unzip"
    )
    print("Done.")


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    missing = check_existing()

    if not missing:
        print("All dataset files present. You're good to go!")
        return

    print("\nThe Movies Dataset files are missing.")
    print("Options:")
    print("  1. Download automatically (requires Kaggle API key)")
    print("  2. Manually download from:")
    print("     https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset")
    print(f"     and extract to: {os.path.abspath(DATA_DIR)}/")
    print("  3. Skip — the app will run in demo mode with 150 curated movies.\n")

    choice = input("Download now? [y/N]: ").strip().lower()
    if choice == 'y':
        download_kaggle()
        missing = check_existing()
        if not missing:
            print("Setup complete!")
        else:
            print(f"Still missing: {missing}")
    else:
        print("Running in demo mode — no dataset download needed.")

    # Clear preprocessing cache if any
    cache_path = os.path.join(os.path.dirname(__file__), 'backend', 'cache', 'processed_data.pkl')
    if os.path.exists(cache_path):
        os.remove(cache_path)
        print("Cache cleared.")


if __name__ == '__main__':
    main()
