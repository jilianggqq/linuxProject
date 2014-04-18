-- 虚目录找出modules
SELECT virtualpathtomodules.ModuleId, module.ModuleName
			FROM  virtualpathtomodules, module
			WHERE virtualpathtomodules.virtualDirId = '24'
			and virtualpathtomodules.moduleID = module.Id
			ORDER BY module.weight DESC;

-- 明显，第三个sql要比第二个快很多，（6ms vs 24ms）。
-- 在第一个sql中，ModuleId早已经被查了出来，根本没有必要再去关联。
SELECT virtualpathtomodules.ModuleId, module.ModuleName
			FROM  virtualpathtomodules, module
			WHERE virtualpathtomodules.virtualDirId = '24'
			and virtualpathtomodules.moduleID = module.Id
			ORDER BY module.weight DESC;

SELECT modulerelation.ModuleId, modulerelation.LogicRelation, modulerelation.RelationType
			FROM  virtualpathtomodules, modulerelation, module
			WHERE virtualpathtomodules.virtualDirId = '24'
			and virtualpathtomodules.moduleID = module.Id
			and module.Id = modulerelation.ModuleId;

SELECT modulerelation.ModuleId, modulerelation.LogicRelation, modulerelation.RelationType
			FROM   modulerelation where ModuleId in (49,58);

-- 如果relationtype=2，则module的依赖关系是menuconfig+if


SELECT  virtualpathtomodules.moduleID, module.ModuleName 
			FROM  virtualpathtomodules, module
			WHERE virtualpathtomodules.virtualDirId = '24'
			and virtualpathtomodules.moduleID = module.Id;

SELECT modulerelation.ModuleId, modulerelation.RelationType
				FROM modulerelation 
				WHERE LogicRelation LIKE '%MMU%';

SELECT modulerelation.ModuleId, modulerelation.RelationType
				FROM modulerelation 
				WHERE LogicRelation LIKE '%X86_32%';