#!/bin/bash

# Script to run different test configurations for the Media Pulse platform

# Set colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display help information
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  echo -e "${BLUE}Media Pulse Testing Tool${NC}"
  echo -e "Usage: ./run-tests.sh [OPTIONS]"
  echo ""
  echo -e "${YELLOW}Options:${NC}"
  echo "  all           Run all tests (default)"
  echo "  basic         Run only basic tests to verify setup"
  echo "  frontend      Run only frontend tests"
  echo "  backend       Run only backend tests"
  echo "  integration   Run only integration tests"
  echo "  component     Run specific component tests (e.g., ./run-tests.sh component ChatWidget)"
  echo "  watch         Run tests in watch mode"
  echo "  coverage      Run tests with coverage reporting"
  echo "  --help, -h    Display this help message"
  echo ""
  echo -e "${YELLOW}Examples:${NC}"
  echo "  ./run-tests.sh basic              # Run basic tests"
  echo "  ./run-tests.sh frontend           # Run all frontend tests"
  echo "  ./run-tests.sh component ChatWidget # Test only the ChatWidget component"
  exit 0
fi

# Set the default test command with our CommonJS configuration
BASE_COMMAND="npx jest --config=jest.config.cjs"

# Process command line arguments
case "$1" in
  "basic")
    echo -e "${GREEN}Running basic tests to verify setup...${NC}"
    test_command="$BASE_COMMAND tests/basic.test.js"
    ;;
  "frontend")
    echo -e "${GREEN}Running frontend tests...${NC}"
    test_command="$BASE_COMMAND --testPathPattern=tests/frontend"
    ;;
  "backend")
    echo -e "${GREEN}Running backend tests...${NC}"
    test_command="$BASE_COMMAND --testPathPattern=tests/backend"
    ;;
  "integration")
    echo -e "${GREEN}Running integration tests...${NC}"
    test_command="$BASE_COMMAND --testPathPattern=tests/integration"
    ;;
  "component")
    if [ -z "$2" ]; then
      echo -e "${RED}Error: No component name provided${NC}"
      echo "Usage: ./run-tests.sh component [ComponentName]"
      exit 1
    fi
    echo -e "${GREEN}Running tests for component: $2...${NC}"
    test_command="$BASE_COMMAND -t $2"
    ;;
  "watch")
    echo -e "${GREEN}Running tests in watch mode...${NC}"
    test_command="$BASE_COMMAND --watch"
    ;;
  "coverage")
    echo -e "${GREEN}Running tests with coverage...${NC}"
    test_command="$BASE_COMMAND --coverage"
    ;;
  "all" | "")
    echo -e "${GREEN}Running all tests...${NC}"
    test_command="$BASE_COMMAND"
    ;;
  *)
    echo -e "${RED}Unknown option: $1${NC}"
    echo "Run ./run-tests.sh --help for usage information"
    exit 1
    ;;
esac

# Execute the test command
echo -e "${BLUE}Executing: $test_command${NC}"
eval $test_command

# Check if tests passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Tests completed successfully!${NC}"
else
  echo -e "${RED}✗ Tests failed${NC}"
  exit 1
fi