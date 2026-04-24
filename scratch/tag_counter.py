
import sys

def count_tags(filepath, start_line, end_line):
    with open(filepath, 'r') as f:
        lines = f.readlines()[start_line-1:end_line]
    
    open_divs = 0
    close_divs = 0
    open_motion_divs = 0
    close_motion_divs = 0
    open_animate = 0
    close_animate = 0
    
    for line in lines:
        open_divs += line.count('<div')
        close_divs += line.count('</div')
        open_motion_divs += line.count('<motion.div')
        # note: closing motion div is usually </motion.div>
        close_motion_divs += line.count('</motion.div')
        open_animate += line.count('<AnimatePresence')
        close_animate += line.count('</AnimatePresence')

    print(f"Divs: {open_divs} / {close_divs}")
    print(f"Motion Divs: {open_motion_divs} / {close_motion_divs}")
    print(f"AnimatePresence: {open_animate} / {close_animate}")

if __name__ == "__main__":
    count_tags(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
