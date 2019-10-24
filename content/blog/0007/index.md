---
title: "Managing Git projects on a mass scale"
date: "2019-07-19T15:26:02+02:00"
tags:
    - git
    - software
    - software development
    - yktools
categories:
    - software development
author: "Dmitry Kann"
image: "git.png"
---

Anyone who has been in the software development business for a while, is certainly familiar with the hassle of arranging, keeping track of, pulling, committing etc. of dozens of local Git repositories being used or developed.

<!--more-->

The routine of keeping and tidying up grows painful very quickly as you clone more and more repositories, either from GitHub or your local server.

Time to time, working tirelessly on five projects at once, you would forget to push or even commit your changes.

On one hand, it's a matter of self-discipline and a structured working process, which I believe any *good* developer must work out for him/herself and adhere to.

On the other hand, you don't want to spend half of your working day opening, checking, closing your Git projects.

## Meet git-all

To address these chores, a while ago I've come up with a very simple yet effective command-line utility of mass ~~destruction~~ local repository management.
 
Please meet [git-all](https://github.com/yktoo/yktools/blob/master/git-all), a member of the [yktools](https://github.com/yktoo/yktools) family. It's a simple Bash script that traverses all your Git repos and runs the same `git` command against them.

It can run in two modes:

* Running `git-all <command> <args...>` will search Git repositories (i.e. directories having `.git` subdirectory right under them) starting from your code root (see the `CODE_ROOT_DIR` at the beginning of the script).<br>
  This mode *ignores* all directories whose name starts with an underscore ( `_` ) and everything below them.<br>
  I mostly use this behaviour to skip updates to things I don't manage, like sources I've temporarily checked out, or projects specific to some environment.
* Giving a `.` as the first argument: `git-all . <command> <args...>` will search Git repositories *starting from the current directory*, whatever it may be. In this mode no directory is ignored, so it can be used to bypass the limitations of the previous mode.  

## Usage and examples

First, you need to edit the value of [CODE_ROOT_DIR](https://github.com/yktoo/yktools/blob/master/git-all#L15).

Then you can feed `git-all` any Git command and arguments as if it was `git`, either with or without the `.` as the first argument:

{{< imgfig "ga-screencast.gif" >}}

So one might think of commands like:

```bash
# Show status of all repositories
git-all status

# Show short status
git-all status -s

# Pull from all default remotes
git-all pull

# Prune all orphaned remote branches
git-all remote prune origin

# Rename all remotes
git-all remote rename origin github
```

... and so on.
 
## Closing notes

Since I'm using it every so often, it's been convenient to have a shell alias for it.
 
You can add this to your `~/.bashrc` or like:

```bash
alias ga=/path/to/yktools/git-all
```

And then use `ga` to invoke the command, like in the screencast above.
