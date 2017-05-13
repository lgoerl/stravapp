CREATE TABLE athletes(
  id integer primary key,
  name varchar,
  city varchar,
  state varchar,
  country varchar,
  lat decimal(8,6),
  lon decimal(9,6),
  member_type varchar
);


CREATE TABLE routes(
  id integer primary key,
  athlete_id integer,
  name varchar,
  length_in_meters decimal(12),
  elevation_gain_in_meters decimal(12),
  route_type integer,
  sub_type integer,
  popularity boolean,
  start_lat decimal(8,6),
  start_lon decimal(9,6),
  starting_point_geo_asset_name varchar,
  starting_point_geo_asset_cc varchar,
  starting_point_geo_asset_admin1 varchar,
  starting_point_geo_asset_admin2 varchar,
  end_lat decimal(8,6),
  end_lon decimal(9,6),
  ending_point_geo_asset_name varchar,
  ending_point_geo_asset_cc varchar,
  ending_point_geo_asset_admin1 varchar,
  ending_point_geo_asset_admin2 varchar
);


CREATE TABLE route_segments(
route_id integer,
segment_id integer,
segment_index integer,
newly_created_segment boolean,
start_distance decimal(12),
end_distance decimal(12)
);


CREATE TABLE segments(
  id integer primary key,
  name varchar,
  length_in_meters decimal(12),
  elevation_gain_in_meters decimal(12),
  ratio decimal(7,4),
  avg_grade decimal(7,2)
);


CREATE TABLE waypoints(
  route_id integer,
  index integer,
  lat decimal(8,6),
  lon decimal(9,6),
  asset_name varchar,
  asset_cc varchar,
  asset_admin1 varchar,
  asset_admin2 varchar
);