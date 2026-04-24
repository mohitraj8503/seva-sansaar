
import sys
import re

def check_jsx_tags(filepath, start_line, end_line):
    with open(filepath, 'r') as f:
        content = "".join(f.readlines()[start_line-1:end_line])
    
    # Remove comments
    content = re.sub(r'\{/\*.*?\*/\}', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)
    
    # Find all tags
    # This regex matches <Tag, </Tag, and />
    tokens = re.findall(r'<(/?[a-zA-Z0-9\.]+)|(/?>)', content)
    
    stack = []
    i = 0
    while i < len(tokens):
        tag_match, close_match = tokens[i]
        
        if tag_match:
            if tag_match.startswith('/'):
                tag_name = tag_match[1:]
                if not stack:
                    print(f"Error: Unexpected closing tag </{tag_name}>")
                else:
                    last_tag = stack.pop()
                    if last_tag != tag_name:
                        print(f"Error: Mismatched tag </{tag_name}>, expected </{last_tag}>")
            else:
                # It's an opening tag. Look ahead to see if it's self-closing.
                # We need to find the matching > or />
                tag_name = tag_match
                # We search for the next > or /> after this tag_match in the original content
                # This is hard with just tokens.
                # Let's just assume if the next close_match is />, it's self-closing.
                # But there might be other tags inside props (unlikely but possible).
                
                # Simplified: push to stack, and we'll handle /> later.
                stack.append(tag_name)
        elif close_match == '/>':
            if stack:
                stack.pop()
            else:
                print("Error: Unexpected />")
        
        i += 1
    
    if stack:
        print(f"Error: Unclosed tags: {stack}")
    else:
        print("JSX Tags seem balanced (roughly)")

if __name__ == "__main__":
    check_jsx_tags(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
