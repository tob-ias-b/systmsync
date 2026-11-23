# Introduction 
A simple extension to allow uploading of Wahoo SYSTM calendar workouts to intervals.icu

Like what you see?  You can donate via buymeacoffee at [buymeacoffee](https://buymeacoffee.com/iliketurtles) or just [donate](https://www.paypal.com/donate/?hosted_button_id=7KYY2B2C7XH84) any amount.

# Getting Started
* Install the extension.
* Open the options page.
* Add your Athlete Id and API key from intervals.icu
  * In intervals.icu, go to settings.
  * Scroll to bottom.
  * "Developer Settings" on right hand side.
* "Prefer Outdoor" when set to "Yes" will upload outdoor versions of a workout, if available.

# How to Sync
* Go to the calendar page on the Wahoo SYSTM web site [https://systm.wahoofitness.com/calendar](https://systm.wahoofitness.com/calendar?)
* There should be a new button appear on the page next to the "+Plan" button with ".icu".
* When clicked, it will open the extension popup.
* Select the start and end date for your action.
* To send changes from the SYSTM calendar to intervals.icu, click "Sync"
* To remove any items on the SYSTM calendar from intervals.icu click "Delete"
* It doesn't matter if you sync multiple times, the entries are keyed to the unique id in your SYSTM calendar so won't duplicate.
* If you move a workout, just sync again, it will get moved in intervals.icu as well.
* To shift all workouts on the SYSTM calendar within the date range forward or backwards by any amount of days:
  * Enter the increment of days to move items (1 = 1 day, negative numbers will move backwards)
  * Click "Shift"
  * You will then need to sync across the appropriate date range to see your changes in intervals.icu

# Limitations
* Currently "off plan" workouts completed in the SYSTM app cannot be uploaded from the calendar (data is missing).  We presume that you are already syncing workouts directly via SYSTM anyway.

# Futures
* Add +/- power range for outdoor workouts
* Add a button to individual workouts to sync them specifically as outdoor or indoor
* ICalendar (.ics file) download of calendar items

# Build and Test
Currently no unit or regression tests

# Contribute
Not open for public contributions at this time.
