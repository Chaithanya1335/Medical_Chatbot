from setuptools import find_packages,setup

HYPEN_E_DOT = "-e ."


requirements = []

# Get requirements from file
def get_requirements(requirement_path):
    with open(requirement_path, 'r') as f:
        # Reading Lines From Text
        lines = f.readlines() 
        for line in lines:
            # Removing Leading and Trailing Spaces
            requirement = line.strip() 

            # Checking if line is not -e . 
            if requirement!=HYPEN_E_DOT: 
                requirements.append(requirement)


# Setting up the package to Make Components Locally Available
setup(
    name="Medical Bot",
    version="1.0.0",
    author="M.Gnana Chaithanya",
    author_email="m.gnanachaithanya12@gmail.com",
    install_requires = get_requirements("requirements.txt"),
    packages=find_packages(),

)