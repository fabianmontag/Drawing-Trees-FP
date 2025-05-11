-- labeled tree
newtype LTree a = LNode (a, [LTree a])
-- pos labeled tree, int value is horizontal posiiton on some depth
type PosLTree a = LTree (a, Float)
type Extent = [(Float, Float)]

-- helper function to, what happens to child nodes?
movetree :: (PosLTree a, Float) -> PosLTree a
movetree (LNode ((label, posX), subtrees), xd) = LNode ((label, posX+xd), subtrees)

-- helper function to mege extents
merge :: Extent -> Extent -> Extent
merge [] qs = qs
merge ps [] = ps
merge ((p, _) : ps) ((_, q) : qs) = (p, q) : merge ps qs

-- folding, right associative
-- fold :: (a -> b -> b) -> [a] -> b -> b
-- fold f [] b = b
-- fold f (a : l) b = f a (fold f l b)

mergelist :: [Extent] -> Extent
mergelist = foldr merge []

fit :: Extent -> Extent -> Float
fit ((_, p) : ps) ((q, _) : qs) = max (fit ps qs) (p - q + 1.0)
fit _ _ = 0.0

-- extents are absolute so move all
moveextent :: (Extent, Float) -> Extent
moveextent (e, x) = map (\(p, q) -> (p+x, q+x)) e

fitlistl' :: Extent -> [Extent] -> [Float]
fitlistl' acc [] = []
fitlistl' acc (e : es) =
    let x = fit acc e in
    x : fitlistl' (merge acc (moveextent (e, x))) es

fitlistl :: [Extent] -> [Float]
fitlistl = fitlistl' []

fitlistr' :: Extent -> [Extent] -> [Float]
fitlistr' acc [] = []
fitlistr' acc (e : es) =
    let x = -(fit e acc) in
    x : fitlistr' (merge  (moveextent (e, x)) acc) es

fitlistr :: [Extent] -> [Float]
fitlistr es = reverse (fitlistr' [] (reverse es))

mean :: (Float, Float) -> Float
mean (x, y) = (x+y)/2.0

fitlist :: [Extent] -> [Float]
fitlist es = map mean (zip (fitlistl es) (fitlistr es))

design' (LNode (label, subtrees)) =
    let (trees, extents)    = unzip (map design' subtrees) in
    let positions           = fitlist extents in
    let ptrees              = map movetree (zip trees positions) in
    let pextents            = map moveextent (zip extents positions) in
    let resultextent        = (0.0, 0.0) : (mergelist pextents) in
    let resulttree          = LNode ((label, 0.0), ptrees) in
    (resulttree, resultextent)

design tree = fst (design' tree)