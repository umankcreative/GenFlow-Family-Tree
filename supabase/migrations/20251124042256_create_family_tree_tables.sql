/*
  # Create Family Tree Tables

  1. New Tables
    - `family_trees` - Stores family tree projects
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `people` - Stores family members
      - `id` (uuid, primary key)
      - `family_tree_id` (uuid, foreign key)
      - `name` (text)
      - `gender` (text: 'male', 'female', 'other')
      - `birth_date` (date, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `relationships` - Stores connections between people
      - `id` (uuid, primary key)
      - `family_tree_id` (uuid, foreign key)
      - `source_person_id` (uuid, foreign key)
      - `target_person_id` (uuid, foreign key)
      - `relationship_type` (text: 'spouse', 'parent_child')
      - `created_at` (timestamp)

    - `positions` - Stores node positions for the visualization
      - `id` (uuid, primary key)
      - `family_tree_id` (uuid, foreign key)
      - `person_id` (uuid, foreign key)
      - `x` (float)
      - `y` (float)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own family trees
*/

CREATE TABLE IF NOT EXISTS family_trees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'My Family Tree',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE family_trees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create family trees"
  ON family_trees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own family trees"
  ON family_trees FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own family trees"
  ON family_trees FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own family trees"
  ON family_trees FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_tree_id uuid NOT NULL REFERENCES family_trees(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'New Member',
  gender text NOT NULL DEFAULT 'other',
  birth_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view people in their family trees"
  ON people FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = people.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create people in their family trees"
  ON people FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = people.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update people in their family trees"
  ON people FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = people.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = people.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete people in their family trees"
  ON people FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = people.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  );


CREATE TABLE IF NOT EXISTS relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_tree_id uuid NOT NULL REFERENCES family_trees(id) ON DELETE CASCADE,
  source_person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  target_person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relationships in their family trees"
  ON relationships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = relationships.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create relationships in their family trees"
  ON relationships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = relationships.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete relationships in their family trees"
  ON relationships FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = relationships.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  );


CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_tree_id uuid NOT NULL REFERENCES family_trees(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  x float NOT NULL,
  y float NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(family_tree_id, person_id)
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view positions in their family trees"
  ON positions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = positions.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create positions in their family trees"
  ON positions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = positions.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update positions in their family trees"
  ON positions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = positions.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_trees
      WHERE family_trees.id = positions.family_tree_id
      AND family_trees.user_id = auth.uid()
    )
  );

CREATE INDEX idx_people_family_tree_id ON people(family_tree_id);
CREATE INDEX idx_relationships_family_tree_id ON relationships(family_tree_id);
CREATE INDEX idx_positions_family_tree_id ON positions(family_tree_id);
