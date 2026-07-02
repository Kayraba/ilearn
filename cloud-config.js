/* =====================================================================
   iLearn — shared database (Supabase) configuration
   ---------------------------------------------------------------------
   Fill in the two values below to make learner progress SYNC ACROSS
   DEVICES AND BROWSERS. Leave them blank and the app works exactly as
   before (stored only in the local browser).

   How to get them (free):
     1. Create a free project at https://supabase.com
     2. In the Supabase SQL editor, run the SQL in SUPABASE-SETUP.sql
        (included in this folder) to create the "learners" table.
     3. Project Settings -> API -> copy:
          - "Project URL"      -> paste into url below
          - "anon public" key  -> paste into anonKey below
   ===================================================================== */
window.ILEARN_CLOUD = {
  url: 'https://dfcimrpecqcxxtvhoabe.supabase.co',
  anonKey: 'sb_publishable__6VUloJO6Cct_BjSzLmgIQ_ynGttGAV',
};