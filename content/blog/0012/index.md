---
title: "Hugo toolbox: image figure shortcode imgfig"
date: "2019-10-08T15:13:20+02:00"
tags:
    - Hugo
    - tips & tricks
categories:
    - software development
    - Hugo
author: Dmitry Kann
image: "/images/logos/hugo-logo.png"
---

After a few months with {{< a "0006" "Hugo" >}} I believe I've worked out some practices one might find useful.

In this post I'd like to introduce a shortcode I'm using **a lot** in my posts: `imgfig`.

<!--more-->

## What are shortcodes?

In short, a *shortcode* is a kind of template you can use in your content files. They can be trivial, like those wrapping a piece of text in a `<b>...</b>` sequence, or quite involved like the built-in `tweet` shortcode. You can learn more on that from the {{< a "https://gohugo.io/content-management/shortcodes/" "official Hugo documentation" >}}.

Shortcodes can either be a singular `{{</* ... */>}}` tag or paired, with an opening and a closing tag, and they can optionally be given parameters:

```html
{{</* name param1 param2 ... */>}}
```

## The `imgfig` shortcode

Now to the objective of this article.

Nearly any webpage makes use of images, many of them also mix internal and external ones, yet they are expected to be rendered/formatted in the same way.

This was my rationale behind creating a versatile implementation that could handle the following three types of image resources:

1. An external image referenced by a regular URL in the form `http(s)://...`;
2. An internal image served through the `static` Hugo's directory;
3. An image stored as a {{< a "https://gohugo.io/content-management/page-resources/" "page resource" >}}.

### Usage

The syntax for this shortcode is as follows:

```html
{{</* imgfig "url_or_reference" "image_caption" */>}}
```

* Use any of the three options listed above for `url_or_reference`. This argument is **mandatory**. In the case of a page resource (option **3**), an error will be thrown if Hugo failed to find it. I find this additional consistency check quite useful.
* `image_caption` is **optional**, if given, it will become the caption of the figure object.

### The code

Eventually I've arrived at the following implementation—save it as `/layouts/shortcodes/imgfig.html` in your project or template:

{{< highlight html "linenos=table" >}}
<figure class="figure">
    {{ $url := .Get 0 }}
    {{ if not (findRE "^(/|http(s?)://)" $url) }}
        {{ $url = ($.Page.Resources.GetMatch $url).RelPermalink }}
    {{ end }}
    <a href="{{ $url }}"><img src="{{ $url }}" alt="{{ .Get 1 }}" class="figure-img img-fluid"></a>
    {{ with .Get 1 }}<figcaption class="figure-caption">{{ . }}</figcaption>{{ end }}
</figure>
{{< /highlight >}}

A brief walk-through:

* Lines **1** and **8** cause the whole thing to be wrapped as a `<figure>` element, which is the recommended way to present (named) images.
* Line **2** initialises the image's source URL to the first argument passed.
* Line **3** checks if the passed source is a URL starting with `http(s)://` or an absolute path starting with a `/`. If it isn't the case, it's considered to be a page resource resolved in line **4**.
* Line **6** inserts an `<img ...>` tag.
* Line **7** adds an optional caption.

This implementation uses {{< a "https://getbootstrap.com/docs/4.3/content/figures/" "figure styles" >}} from Bootstrap 4 CSS.