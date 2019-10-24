---
title: "Meet the all-new Yktoo Solutions website!"
date: "2019-07-15T18:50:22+02:00"
description: >-
    The [yktoo.solutions](https://yktoo.solutions/) website has been entirely redesigned. It's now driven by [Hugo](https://gohugo.io/), a mighty static website generator.
tags: 
    - announcement
    - Hugo
    - web
    - website
categories:
    - announcements
author: "Dmitry Kann"
image: "website-main-page.jpg"
---

It's been almost three years since the first incarnation of the Yktoo Solutions website has seen the light. That first version has been built on a technology stack similar to my "flagship" website [yktoo.com](https://yktoo.com/), i.e. the good old LAMP (Linux, Apache, MySQL, and PHP).

As we were planning to extend our operation, a new representation on the web was necessary.

There was also another wish, to implement a proper news feed or, rather, a blog, that would inform the general public of current developments and, at the same time, provide some useful technical insights (of which we have plenty).  

## Let's Go Static

So, after some background research I have concluded that a *static website* would actually suit our needs perfectly:

* It **can be deployed anywhere**, on any web hosting, CDN, public web service, even on a Raspberry PI or a mobile phone. Not that we planned to do that, but some of it can prove useful while developing.
* It's **super fast** because it consists only of static pages and related elements (scripts, images, stylesheets).
* It's **dead secure**. There's zero chance for the intruder to break in as there's nothing to break. The only thinkable loophole is about your deployment process, but that's easily addressed, either by pulling from an external code repository or via whitelisting of IP addresses that are allowed to upload.
* The entire source of the website can be kept in a **version control system**. There's no manual action involved in the deployment process and hence no room for human error.

Yet, it was a bit of a paradigm shift. I used to think of things like navigation menus, tags, pagination buttons as of content generated on the server while serving a specific page.

But if you give it a thought, you'll realise these things *are always static* given a specific version of your content. There's exactly `X` pages, `Y` menu items and `Z` tags, which you can all pre-render in advance, and forget until more content is added. In which case you simply re-render the entire website.

That last step sounds like a hefty job, but here's the point: how many times does the website get viewed per *one update of its content*? Hundreds, maybe thousands or even millions of times.

## Enter Hugo

There's a number of static website generators available: [Next.js](https://nextjs.org/), [Gatsby](https://www.gatsbyjs.org/), [Jekyll](https://jekyllrb.com/) and others.

However, having weighed the options, I've concluded that the best candidate for the job was [Hugo](https://gohugo.io/).

{{< imgfig "/images/logos/hugo-logo.png" >}}

The major considerations were:

* Hugo is free and [open source](https://github.com/gohugoio/hugo). I love both.
* It's a Go application and it's blazing-fast, with typical page generation time of under **1 ms**.
* It's pretty sophisticated in the way it processes your data. And you can make it as complex as you wish, sky is the limit.
* Hugo is readily available in mainline Ubuntu repositories, although for the most recent version you can use a snap package:  
  `snap install hugo`
* And, last but not least, it has an impressive service record: [Let's Encrypt](https://gohugo.io/showcase/letsencrypt/), [1Password support](https://gohugo.io/showcase/1password-support/) and [Pharmaseal](https://gohugo.io/showcase/pharmaseal/), to name a few. And it has 36K+ stars and 500+ contributors on GitHub, which makes it probably the fastest-paced site generator.

## To Blogs and Beyond

What's entirely new to this website is the [blog](/blog) you're reading right now. 

The blog also features a Comments section, driven by another open-source Go application called [Commento](https://commento.io/).

I loved the simplicity and the speed of Commento, which is why I also migrated to it from bulky and data-hungry Disqus on [yktoo.com](https://yktoo.com/).

Our Commento instance is self-hosted and runs in the cloud in a fully-automated Docker Compose layout. I'm going to explore this setup in more detail in a separate post.  

Stay tuned.
