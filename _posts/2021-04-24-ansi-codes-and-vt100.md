---
layout: post
title: ANSI Codes and VT100
date: 2021-04-24
category: post
---
### Change of Scenery
This post, I'm going to take a step back and touch on a non-python related topic: ANSI Codes. ANSI Codes, or ANSI escape sequences, are a set of standards made for terminals and terminal emulators. More specifically these escape sequences can do many things in one's terminal, such as changing the color of your text, changing cursor position, et cetera. One of the first terminals to support ANSI codes is the VT100 back in August 1979 (a bit of a tangential history lesson).

### So What?
In short, by gaining access to the features a terminal supporting escape sequences can have, we can do some neat things in practice. For example, if I were to program [a text editor in C](https://github.com/antirez/kilo), we can write escape sequences that move the cursor to different parts of the terminal, and then write to it. This is very useful when writing things like a header line you might want to implement, or even the tilde symbols you'll encounter in editors like Vim, which usually indicate the end of a file.

### Color Coding
I mentioned earlier that changing the color of your text is one of the ways you can use ANSI escape codes. With that said, let's give us an _actual_ example of how that might work. Say we want to print "Hello World", but make the text red. We can start off our escape sequence with an escape code. Since this is ASCII decimal code 27, we can just write `\x1B` for a hexadecimal representation, or `\033` for an octal representation (for now, we'll stick to hex). Next, we add a bracket `[`, followed by `0;31`, which indicates that we want a red foreground (red text). Putting those together, we get an escape sequence of `\033[0;31`. From here, we can write our "Hello World" string, giving us the full string of `\033[0;31Hello World`.

Go ahead and try it yourself, open up a supported terminal, and run `echo "\033[0;31Hello World"`. You should be able to see red text. You also might be wondering how you can revert the text back to the default white. In such a case, just use the sequence `\033[0;37`.

Click [here](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors) if you would like a better idea of what other colors you can use with ANSI escape codes.

Similarly, you can also check the [VT100 user guide](https://vt100.net/docs/vt100-ug/chapter3.html) for other uses of escape sequences.