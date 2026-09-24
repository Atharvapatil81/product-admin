# Notes

## Search vs category filter
The DummyJSON API doesn't let you search and filter by category at the same time. I decided that search should win — if someone types a search term, the category dropdown gets disabled with a small note explaining why. I felt this was better than silently ignoring one of the two, since the user can actually see what's happening instead of wondering why their filter isn't working.

## How I handled add/edit/delete
DummyJSON accepts the add/edit/delete requests and sends back a success response, but it doesn't actually save anything on their server — a refresh would wipe out any changes. So I built a small local layer that saves added/edited/deleted products in the browser's localStorage and merges them with whatever the API returns. That way the app still feels fully functional and your changes stick around even after a refresh, even though nothing is really being saved on DummyJSON's end.

## A problem I faced
I ran into a tricky bug with the root layout file — I had the `<body>` tag missing after wrapping the app with my auth and product-overrides providers, which caused a hydration error and broke every page. It took a bit of back-and-forth to actually spot it since the error messages pointed to a few different files. Once I compared the file line by line I found the missing `<body>` and fixed the nesting properly.

I also had some early confusion with git branches — I created a feature branch to work on, but kept accidentally trying to push straight to main before it was ready, and hit a rejected push a couple of times because main and my branch had diverged. I ended up doing the merges through GitHub's pull request UI instead of raw terminal merges, which was much easier to follow and kept the history clean.

## Where AI helped
I used AI (Claude) as a guide while building this — it helped me plan the structure, explained concepts like interceptors, debouncing, and race conditions, and gave me code to type in and test myself. I didn't just copy-paste blindly — I read through each file, tested it, and fixed real bugs that came up along the way (like the layout issue above). I can walk through and explain any part of this code, and make changes to it live.