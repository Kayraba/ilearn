/* =====================================================================
   iLearn — shared database (Supabase) configuration.

   Filling these in makes learner progress sync across devices. Leaving them
   blank keeps everything in the local browser, and the app works either way.

   WHAT YOU ARE AGREEING TO BY FILLING THIS IN
   -------------------------------------------
   This is a static site, so this file is downloaded by every visitor. The anon
   key is designed to be public and that part is fine. What is not obvious is
   the consequence: the row-level security policy in SUPABASE-SETUP.sql has to
   be permissive enough for the staff dashboard to list every learner, which
   means anyone who opens this file can list them too.

   So only point this at a project holding fabricated pilot data. Read the notes
   at the top of SUPABASE-SETUP.sql before using it with real learners — it sets
   out what has to change first (Supabase Auth and per-row ownership).

   Setup:
     1. Create a free project at https://supabase.com
     2. Run SUPABASE-SETUP.sql in the Supabase SQL editor.
     3. Project Settings -> API -> copy the Project URL and the anon public key
        into the two fields below.
   ===================================================================== */
window.ILEARN_CLOUD = {
  url: '',
  anonKey: '',
};
