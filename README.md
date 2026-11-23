# Introduction 
A simple extension to allow uploading of Wahoo SYSTM calendar workouts to intervals.icu

Credit to the developer of the "SYSTM Fit Export" extension which saved me a lot of the initial leg work figuring out the APIs.

https://chromewebstore.google.com/detail/minmiblnbkhcjojgmnlbnpdefimcfmif

Like what you see?  You can donate via buymeacoffee at [buymeacoffee](https://buymeacoffee.com/iliketurtles).

# Getting Started
* Install the extension.
* Open the options page.
* Add your Athlete Id and API key from intervals.icu
  * In intervals.icu, go to settings.
  * Scroll to bottom.
  * "Developer Settings" on right hand side.
* "Delete Sync?" will remove any items in the sync window if set to "Yes".
* "Prefer Outdoor" when set to "Yes" will upload outdoor versions of a workout, if available.

# How to Sync
* Go to the calendar page on the Wahoo SYSTM web site [https://systm.wahoofitness.com/calendar](https://systm.wahoofitness.com/calendar?)
* There should be a new button appear on the page next to the "+Plan" button with ".icu".
* When clicked, it will take the date currently in the querystring in the location bar and sync all items from that date for 7 days.
* To sync further, scroll in either direction until the next or previous date is displayed, and click again.
* If you need to remove items from your intervals.icu calendar, switch the "Delete Sync?" option in the options page to "Yes".  Further syncs will then delete the items instead of uploading/updating them.
* It doesn't matter if you sync multiple times, the entries are keyed to the unique id in your SYSTM calendar so won't duplicate.
* If you move a workout, just sync again, it will get moved in intervals.icu as well.

# Limitations
* Currently "off plan" workouts completed in the SYSTM app cannot be uploaded from the calendar (data is missing).

# Future
* Allow sync of plan items only with a button next to the plan name.
* Integrate using OAuth with intervals.icu instead of needing individual API keys.
* Integrate with other platforms.

# Build and Test
Currently no unit or regression tests

# Contribute
Not open for public contributions at this time.
