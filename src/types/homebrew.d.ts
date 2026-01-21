export interface Formula {
	name: string;
	full_name: string;
	tap: string;
	oldnames: string[];
	aliases: string[];
	versioned_formulae: string[];
	desc: string;
	license: string;
	homepage: string;
	versions: Versions;
	urls: URLs;
	revision: number;
	version_scheme: number;
	bottle: Bottle;
	pour_bottle_only_if: string | null;
	keg_only: boolean;
	keg_only_reason: string | null;
	options: string[];
	build_dependencies: string[];
	dependencies: string[];
	test_dependencies: string[];
	recommended_dependencies: string[];
	optional_dependencies: string[];
	uses_from_macos: string[];
	uses_from_macos_bounds: UsesFromMacOSBound[];
	requirements: string[];
	conflicts_with: string[];
	conflicts_with_reasons: string[];
	link_overwrite: string[];
	caveats: string | null;
	installed: Installed[];
	linked_keg: string;
	pinned: boolean;
	outdated: boolean;
	deprecated: boolean;
	deprecation_date: string | null;
	deprecation_reason: string | null;
	deprecation_replacement_cask: string | null;
	deprecation_replacement_formula: string | null;
	disabled: boolean;
	disable_date: string | null;
	disable_reason: string | null;
	disable_replacement: string | null;
	post_install_defined: boolean;
	service: string | null;
	tap_git_head: string;
	ruby_source_path: string;
	ruby_source_checksum: RubySourceChecksum;
	head_dependencies: HeadDependencies;
	variations: Variations;
	analytics?: Analytics;
	generated_date?: Date;
}

export interface Cask {
	token: string;
	full_token: string;
	old_tokens: string[];
	tap: string;
	name: string[];
	desc: string;
	homepage: string;
	url: string;
	url_specs: URLSpecs;
	version: string;
	installed: string | null;
	installed_time: string | null;
	bundle_version: string | null;
	bundle_short_version: string | null;
	outdated: boolean;
	sha256: string;
	artifacts: Artifact[];
	caveats: string | null;
	depends_on: DependsOn;
	conflicts_with: ConflictsWith;
	container: string | null;
	auto_updates: boolean;
	deprecated: boolean;
	deprecation_date: string | null;
	deprecation_reason: string | null;
	deprecation_replacement_cask: string | null;
	deprecation_replacement_formula: string | null;
	disabled: boolean;
	disable_date: string | null;
	disable_reason: string | null;
	disable_replacement: string | null;
	tap_git_head: string;
	languages: string[];
	ruby_source_path: string;
	ruby_source_checksum: RubySourceChecksum;
	variations: Variations;
	analytics?: Analytics;
	generated_date?: Date;
}

export type Package = Formula & Cask;

export type PackageFilteredData = {
	name: string;
	token: string;
	type: string;
	version: string;
	desc: string;
	homepage: string;
};

export interface PackageAnalytics {
	category: string;
	total_items: number;
	start_date: Date;
	end_date: Date;
	total_count: number;
	items: ItemCask[] | ItemForumla[];
}

export interface ItemCask {
	number: number;
	cask: string;
	count: string;
	percent: string;
}
export interface ItemForumla {
	number: number;
	formula: string;
	count: string;
	percent: string;
}

export interface Bottle {
	stable: BottleStable;
}

export interface BottleStable {
	rebuild: number;
	root_url: string;
	files: Files;
}

export interface Files {
	[key: string]: BottleFile;
}

export interface BottleFile {
	cellar: string;
	url: string;
	sha256: string;
}

export interface HeadDependencies {
	build_dependencies: string[];
	dependencies: string[];
	test_dependencies: string[];
	recommended_dependencies: string[];
	optional_dependencies: string[];
	uses_from_macos: string[];
	uses_from_macos_bounds: UsesFromMacOSBound[];
}

export interface UsesFromMacOSBound {
	since: string;
}

export interface Installed {
	version: string;
	used_options: string[];
	built_as_bottle: boolean;
	poured_from_bottle: boolean;
	time: number;
	runtime_dependencies: RuntimeDependency[];
	installed_as_dependency: boolean;
	installed_on_request: boolean;
}

export interface RubySourceChecksum {
	sha256: string;
}

export interface URLs {
	stable: URLsStable;
	head: Head;
}

export interface Head {
	url: string;
	branch: string;
	using: string | null;
}

export interface Analytics {
	install: { [key: string]: Record<string, number> };
	install_on_request: { [key: string]: Record<string, number> };
	build_error: BuildError;
}

export interface BuildError {
	the30d: Record<string, number>;
}

export interface RuntimeDependency {
	full_name: string;
	version: string;
	revision: number;
	pkg_version: string;
	declared_directly: boolean;
}

export interface URLsStable {
	url: string;
	tag: string | null;
	revision: string | null;
	using: string | null;
	checksum: string;
}

export interface Variations {
	x8664_linux: linux;
	arm64_linux: linux;
}

export interface linux {
	dependencies: string[];
	head_dependencies: HeadDependencies;
}

export interface Versions {
	stable: string;
	head: string;
	bottle: boolean;
}

export interface Artifact {
	uninstall?: Uninstall[];
	app?: string[];
	binary?: Array<BinaryClass | string>;
	uninstall_postflight: string | null;
	dictionary?: string[];
	installer?: Installer[];
	postflight?: string | null;
	pkg?: string[] | Choices[];
	zap?: Zap[];
	suite?: string[];
	font?: string[];
}

export interface Choices {
	choices: ChoicesObject[];
}

export interface ChoicesObject {
	attributeSetting: number;
	choiceAttribute: string;
	choiceIdentifier: string;
}

export interface Installer {
	script: InstallerScript;
}

export interface InstallerScript {
	executable: string;
}

export interface URLSpecs {
	verified: string | null;
	referer: string | null;
	user_agent: string | null;
}

export interface ConflictsWith {
	cask: string[];
	formula: string[];
}

export interface DependsOn {
	[key: string]: MacOS;
}

export interface MacOS {
	[key: string]: string[];
}

export interface Uninstall {
	launchctl?: string[];
	quit?: string;
	delete?: string[];
	rmdir?: string;
}

export interface Zap {
	trash?: string[];
	rmdir?: string[];
	launchctl?: string[];
}

export interface BinaryClass {
	target: string;
}
