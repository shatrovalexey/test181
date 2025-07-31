DECLARE @collaborator_id BIGINT = 710253
DECLARE @collaborator_age_limit BIGINT = 40;

WITH [subdivision_subtree] AS (
    SELECT
        [s1].[id]
        , [s1].[parent_id]
    FROM
        [dbo].[subdivisions] AS [s1]

            INNER JOIN [dbo].[collaborators]  AS [c1]
                ON ([s1].[id] = [c1].[subdivision_id])
    WHERE
        ([c1].[id] = @collaborator_id)
    
    UNION ALL

    SELECT
        [s1].[id]
        , [s1].[parent_id]
    FROM
        [dbo].[subdivisions] AS [s1]

            INNER JOIN [subdivision_subtree] AS [sd1]
                ON ([s1].[parent_id] = [sd1].[id])
)
, [subdivision_tree_level] AS (
    SELECT
        [s1].[id]
        , [s1].[parent_id]
        , 0 AS [level]
    FROM
        [dbo].[subdivisions] AS [s1]
    WHERE
        ([s1].[parent_id] IS null)

    UNION ALL

    SELECT
        [s1].[id]
        , [s1].[parent_id]
        , [sdl1].[level] + 1 AS [level]
    FROM
        [dbo].[subdivisions] AS [s1]

            INNER JOIN [subdivision_tree_level] AS [sdl1]
                ON ([s1].[parent_id] = [sdl1].[id])
)
, [subdivision_colls_count] AS (
    SELECT 
        [stl1].[id]
        , [stl1].[level]
        , count([c1].[id]) AS [count]
    FROM
        [subdivision_tree_level] AS [stl1]

            LEFT OUTER JOIN [dbo].[collaborators] AS [c1]
                ON ([c1].[subdivision_id] = [stl1].[id])
    GROUP BY
        [stl1].[id]
        , [stl1].[level]
)
SELECT
    [c1].[id]
    , [c1].[name]
    , [s1].[name] AS [sub_name]
    , [cc1].[id] AS [sub_id]
    , [cc1].[level] AS [sub_level]
    , [cc1].[count] AS [colls_count]
FROM
    [dbo].[collaborators] AS [c1]

        INNER JOIN [dbo].[subdivisions] AS [s1]
            ON ([s1].[id] = [c1].[subdivision_id])

        INNER JOIN [subdivision_subtree] AS [sd1]
            ON ([c1].[subdivision_id] = [sd1].[id])

        INNER JOIN [subdivision_colls_count] AS [cc1]
            ON ([sd1].[id] = [cc1].[id])

        LEFT OUTER JOIN [dbo].[collaborators] AS [c2]
            ON ([s1].[id] <> [c2].[subdivision_id])
WHERE
    ([c1].[age] < @collaborator_age_limit)
        AND ([c2].[id] = @collaborator_id)
        AND ([c1].[id] NOT IN (100055, 100059));