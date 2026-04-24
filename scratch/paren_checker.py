
import sys

def check_parens(filepath, start_line, end_line):
    with open(filepath, 'r') as f:
        lines = f.readlines()[start_line-1:end_line]
    
    balance = 0
    for i, line in enumerate(lines):
        for char in line:
            if char == '(': balance += 1
            elif char == ')': balance -= 1
        if balance < 0:
            print(f"Negative balance at line {start_line + i}: {line.strip()}")
            balance = 0
    print(f"Final balance: {balance}")

if __name__ == "__main__":
    check_parens(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
