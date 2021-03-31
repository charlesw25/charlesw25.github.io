---
layout: post
title: Introduction to GDB (or How I Learned to Stop Worrying and Love the Debugger)
date: 2021-03-30
category: post
---

### Intro

I was recently given the opportunity to work with GDB. To provide context, my prior experience with GDB has been very limited. We're talking nothing more than a topic for one or two of my undergraduate courses. Being a naïve student at the time, I didn't pay much attention to it. After all, why debug when you can add print statements throughout your code -- especially when projects in university were never grandiose and large in scope. In the time it would take for me to set up and understand the inner workings of a debugger such as GDB, one could have just slapped in a print statement or two, run the code, and get instant feedback. What's not to love?

At least that's what I thought until I found myself having to use it again. Knowing that GDB would be a tool worth learning to a proficient level, this blog aims to give a basic rundown of the inner workings, tips, and tricks you might find handy when you find yourself having to use a debugger.

### Knowing When (and Where) to Stop
Since GDB is a debugging tool, chances are you have some part of your code where things aren't working as expected. When faced with a problem, one of the first things you might want to do is find out *where* in the code are things going awry. This will lead into finding a place in the code where you want to halt execution. Introducing, breakpoints:

* To find a place in your code to break, type: `break linenum` (shorthand for break in GDB is `b`).
* You can also specify which file the line refers to, and not the file you're currently looking at, with `b filename:linenum`.
* Functions? They got 'em. `b function`; `b filename:function`
* Don't want to type out the entire line? Go by offsets which go some number of lines forward or back from the position you're currently at: `break +offset` `break -offset`
* You can also `clear` breakpoints with [clear](https://ftp.gnu.org/old-gnu/Manuals/gdb/html_node/gdb_31.html).
* More information on breakpoints can be found [here.](https://ftp.gnu.org/old-gnu/Manuals/gdb/html_node/gdb_28.html).


### Continuing and Stepping In
Since chances are you don't want to be walking through the entire program when debugging, GDB has a way to `continue` (or `c`) program execution, halting on the next breakpoint.

Maybe you don't want to set breakpoints everywhere, GDB allows you to go on to the next `step` (or `s`) of your program. Step in this case is arbitrary and can range from your next step in running the source code, or the next step in assembly instructions. 

* You can also run step a set number of times with `s count`
* The `finish` command can also come in handy, which continuously runs until the function in the selected stack frame returns.
* The `next` or `n` command functions similarly, with the caveat of not actually stepping into the next stack frame, if applicable. 

### Printing Variables
Another thing that comes in handy is the fact that GDB allows you to print the value of variables with `print` or `p`. Variables which hold pointers can also be dereferenced with an asterisk, revealing the value in memory that was being referenced.

### Viewing the Source Code
When first launching gdb, you'll notice that you can't see the source code of your program. For obvious reasons, this can be a problem. Type `list` or `l` for the debugger to print the lines around the current line you're on.

Not enough? Thankfully, GDB has a TUI (Text User Interface) that allows you to see where in the code you're at. Type `layout src` to open the TUI which displays the source code and command windows. TUI mode can also be enabled with `tui enable`. In this mode, you can scroll up and down the windows with the arrow keys, choosing which window to effect with the `focus name` command.

More on the TUI can be found [here](https://sourceware.org/gdb/current/onlinedocs/gdb/TUI-Commands.html).

### Conclusion

Hopefully now you have a slightly better idea of some of the things you can do with GDB. As you might know, this is my first ever post/blog/etc. I'm mostly documenting new things that I find interesting and might find myself looking back on or referencing, which should explain how things are out-of-order and jumbled together. That being said, there are numerous other posts that better explain GDB (https://web.eecs.umich.edu/~sugih/pointers/gdbQS.html, for starters), however, typing or writing these things out works well for me when trying to learn new things and is something I want to try and improve on as I expand this collection (for posterity's sake!).

### Other Links
* GDB Cheat Sheet: https://in-addr.nl/mirror/GDB%20Cheat%20Sheet.pdf
* GDB Tutorial: https://www.cs.cmu.edu/~gilpin/tutorial/